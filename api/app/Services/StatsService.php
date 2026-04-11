<?php

namespace App\Services;

use App\Models\Wallet;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class StatsService
{
    /**
     * Revenus vs dépenses sur les N derniers mois (mois courant inclus).
     *
     * @return list<array{year:int, month:int, income:int, expenses:int, net:int}>
     */
    public function incomeVsExpenses(int $userId, int $months): array
    {
        $from = Carbon::now()->subMonths($months - 1)->startOfMonth();

        $rows = DB::table('transactions')
            ->where('user_id', $userId)
            ->whereNull('deleted_at')
            ->whereIn('type', ['income', 'expense'])
            ->where('date', '>=', $from->toDateString())
            ->selectRaw(
                "EXTRACT(YEAR FROM date)::int  AS year,
                 EXTRACT(MONTH FROM date)::int AS month,
                 type,
                 SUM(amount)                   AS total"
            )
            ->groupByRaw('EXTRACT(YEAR FROM date), EXTRACT(MONTH FROM date), type')
            ->get()
            ->groupBy(fn ($r) => $r->year . '-' . $r->month);

        $result = [];
        for ($i = $months - 1; $i >= 0; $i--) {
            $d   = Carbon::now()->subMonths($i)->startOfMonth();
            $key = $d->year . '-' . $d->month;
            $grp = $rows->get($key, collect());

            $income   = (int) ($grp->firstWhere('type', 'income')?->total  ?? 0);
            $expenses = abs((int) ($grp->firstWhere('type', 'expense')?->total ?? 0));

            $result[] = [
                'year'     => $d->year,
                'month'    => $d->month,
                'income'   => $income,
                'expenses' => $expenses,
                'net'      => $income - $expenses,
            ];
        }

        return $result;
    }

    /**
     * Répartition des dépenses par catégorie sur une plage de dates.
     *
     * @return list<array{category_id:string|null, name:string, color:string, icon:string|null, amount:int}>
     */
    public function expensesByCategory(int $userId, Carbon $from, Carbon $to): array
    {
        return DB::table('transactions as t')
            ->leftJoin('categories as c', 't.category_id', '=', 'c.id')
            ->where('t.user_id', $userId)
            ->whereNull('t.deleted_at')
            ->where('t.type', 'expense')
            ->whereBetween('t.date', [$from->toDateString(), $to->toDateString()])
            ->selectRaw(
                "t.category_id,
                 c.name,
                 c.color,
                 c.icon,
                 ABS(SUM(t.amount)) AS total"
            )
            ->groupBy('t.category_id', 'c.name', 'c.color', 'c.icon')
            ->orderByDesc('total')
            ->get()
            ->map(fn ($r) => [
                'category_id' => $r->category_id,
                'name'        => $r->name  ?? 'Sans catégorie',
                'color'       => $r->color ?? '#94a3b8',
                'icon'        => $r->icon,
                'amount'      => (int) $r->total,
            ])
            ->all();
    }

    /**
     * KPIs globaux basés sur les 12 derniers mois.
     *
     * @return array{
     *   savings_rate: float,
     *   avg_monthly_expenses: int,
     *   best_month: array{year:int, month:int, net:int}|null,
     *   net_worth: int,
     *   total_income_12m: int,
     *   total_expenses_12m: int
     * }
     */
    public function overview(int $userId): array
    {
        $data = $this->incomeVsExpenses($userId, 12);

        $totalIncome   = array_sum(array_column($data, 'income'));
        $totalExpenses = array_sum(array_column($data, 'expenses'));
        $savingsRate   = $totalIncome > 0
            ? round(($totalIncome - $totalExpenses) / $totalIncome * 100, 2)
            : 0.0;

        $avgExpenses = (int) round($totalExpenses / 12);

        $bestMonth = collect($data)
            ->sortByDesc('net')
            ->first();

        $netWorth = (int) Wallet::withoutGlobalScopes()
            ->where('user_id', $userId)
            ->where('is_archived', 0)
            ->get()
            ->sum(fn ($w) => $w->initial_balance + $w->balance_cache);

        return [
            'savings_rate'         => $savingsRate,
            'avg_monthly_expenses' => $avgExpenses,
            'best_month'           => $bestMonth,
            'net_worth'            => $netWorth,
            'total_income_12m'     => $totalIncome,
            'total_expenses_12m'   => $totalExpenses,
        ];
    }
}
