<?php

namespace App\Services;

use App\Models\Budget;
use App\Models\Transaction;
use App\Models\Wallet;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class DashboardService
{
    public function aggregate(int $userId): array
    {
        return [
            'wallets'              => $this->wallets($userId),
            'current_month'        => $this->monthSummary($userId, Carbon::now()),
            'prev_month'           => $this->monthSummary($userId, Carbon::now()->subMonth()),
            'top_budgets'          => $this->topBudgets($userId, 3),
            'investable'           => $this->investable($userId),
            'recent_transactions'  => $this->recentTransactions($userId, 3),
            'monthly_trend'        => $this->monthlyTrend($userId, 6),
        ];
    }

    // ── Wallets ────────────────────────────────────────────────────────────

    private function wallets(int $userId): array
    {
        $wallets = Wallet::withoutGlobalScopes()
            ->where('user_id', $userId)
            ->where('is_archived', 0)
            ->orderBy('sort_order')
            ->get();

        if ($wallets->isEmpty()) return [];

        // Transactions des 7 derniers jours groupées par wallet + date
        $since = Carbon::now()->subDays(6)->toDateString();

        $txByWalletDate = DB::table('transactions')
            ->whereIn('wallet_id', $wallets->pluck('id'))
            ->whereNull('deleted_at')
            ->where('date', '>=', $since)
            ->selectRaw("wallet_id, date::text AS day, SUM(amount) AS daily_net")
            ->groupBy('wallet_id', 'date')
            ->get()
            ->groupBy('wallet_id');

        return $wallets->map(function (Wallet $w) use ($txByWalletDate) {
            $current        = $w->initial_balance + $w->balance_cache;
            $walletTx       = $txByWalletDate->get($w->id, collect());

            // Sparkline : solde de fin de journée pour chaque jour (D-6 → aujourd'hui)
            $sparkline      = [];
            $runningBalance = $current;

            for ($i = 0; $i < 7; $i++) {
                $day         = Carbon::now()->subDays($i)->toDateString();
                $dailyNet    = (int) ($walletTx->firstWhere('day', $day)?->daily_net ?? 0);
                $sparkline[6 - $i] = $runningBalance;
                $runningBalance   -= $dailyNet;
            }

            return [
                'id'        => $w->id,
                'name'      => $w->name,
                'type'      => $w->type->value,
                'color'     => $w->color,
                'icon'      => $w->icon,
                'balance'   => $current,
                'sparkline' => array_values($sparkline),
            ];
        })->all();
    }

    // ── Résumé mensuel ─────────────────────────────────────────────────────

    private function monthSummary(int $userId, Carbon $date): array
    {
        $start = $date->copy()->startOfMonth()->toDateString();
        $end   = $date->copy()->endOfMonth()->toDateString();

        $agg = DB::table('transactions')
            ->where('user_id', $userId)
            ->whereNull('deleted_at')
            ->whereIn('type', ['income', 'expense'])
            ->whereBetween('date', [$start, $end])
            ->selectRaw(
                "SUM(CASE WHEN type = 'income'  THEN amount ELSE 0 END) AS income,
                 SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) AS expenses"
            )
            ->first();

        $income   = (int) ($agg?->income   ?? 0);
        $expenses = abs((int) ($agg?->expenses ?? 0));
        $net      = $income - $expenses;
        $rate     = $income > 0 ? round($net / $income * 100, 2) : 0.0;

        return ['income' => $income, 'expenses' => $expenses, 'net' => $net, 'savings_rate' => $rate];
    }

    // ── Top budgets ────────────────────────────────────────────────────────

    private function topBudgets(int $userId, int $limit): array
    {
        $now = Carbon::now();

        $budgets = Budget::withoutGlobalScopes()
            ->where('user_id', $userId)
            ->where('period', 'monthly')
            ->where('month', $now->month)
            ->where('year', $now->year)
            ->where('is_active', true)
            ->where('amount', '>', 0)
            ->with('categories:id,name,color,icon')
            ->get();

        if ($budgets->isEmpty()) return [];

        $catIds = $budgets->flatMap(fn ($b) => $b->categories->pluck('id'))->unique()->all();

        if (empty($catIds)) return [];

        $spending = DB::table('transactions')
            ->where('user_id', $userId)
            ->whereNull('deleted_at')
            ->where('type', 'expense')
            ->whereIn('category_id', $catIds)
            ->whereBetween('date', [
                $now->copy()->startOfMonth()->toDateString(),
                $now->copy()->endOfMonth()->toDateString(),
            ])
            ->selectRaw('category_id, ABS(SUM(amount)) AS total')
            ->groupBy('category_id')
            ->pluck('total', 'category_id');

        return $budgets
            ->map(function (Budget $budget) use ($spending) {
                $spent    = $budget->categories->sum(fn ($c) => (int) ($spending[$c->id] ?? 0));
                $pct      = $budget->amount > 0 ? round($spent / $budget->amount * 100, 1) : 0.0;
                $firstCat = $budget->categories->first();

                return [
                    'id'             => $budget->id,
                    'label'          => $firstCat?->name ?? 'Budget',
                    'color'          => $firstCat?->color ?? '#94a3b8',
                    'icon'           => $firstCat?->icon,
                    'budget_amount'  => $budget->amount,
                    'spent'          => $spent,
                    'pct'            => min($pct, 999.9),   // > 100 = over budget
                    'over_budget'    => $spent > $budget->amount,
                    'category_count' => $budget->categories->count(),
                ];
            })
            ->sortByDesc('pct')
            ->take($limit)
            ->values()
            ->all();
    }

    // ── Investissable ──────────────────────────────────────────────────────

    private function investable(int $userId): array
    {
        $source = Wallet::withoutGlobalScopes()
            ->where('user_id', $userId)
            ->where('is_archived', 0)
            ->where('is_default', true)
            ->first()
            ?? Wallet::withoutGlobalScopes()
                ->where('user_id', $userId)
                ->where('is_archived', 0)
                ->orderBy('sort_order')
                ->first();

        if (!$source) {
            return ['amount' => 0, 'source_wallet' => null, 'allocations' => []];
        }

        $nextMonth = Carbon::now()->addMonth();
        $depenses  = (int) Budget::withoutGlobalScopes()
            ->where('user_id', $userId)
            ->where('period', 'monthly')
            ->where('month', $nextMonth->month)
            ->where('year', $nextMonth->year)
            ->sum('amount');

        $solde      = $source->initial_balance + $source->balance_cache;
        $investable = max(0, $solde - $depenses);

        $pockets = Wallet::withoutGlobalScopes()
            ->where('user_id', $userId)
            ->where('is_archived', 0)
            ->whereNotNull('investment_target_pct')
            ->where('investment_target_pct', '>', 0)
            ->orderBy('sort_order')
            ->get();

        $totalPct    = $pockets->sum('investment_target_pct');
        $allocations = $pockets->map(fn ($w) => [
            'wallet' => ['id' => $w->id, 'name' => $w->name, 'color' => $w->color],
            'pct'    => (float) $w->investment_target_pct,
            'amount' => $totalPct > 0 ? (int) ($investable * $w->investment_target_pct / $totalPct) : 0,
        ])->values()->all();

        return [
            'amount'        => $investable,
            'source_wallet' => ['id' => $source->id, 'name' => $source->name],
            'allocations'   => $allocations,
        ];
    }

    // ── Transactions récentes ──────────────────────────────────────────────

    private function recentTransactions(int $userId, int $limit): array
    {
        return Transaction::withoutGlobalScopes()
            ->where('user_id', $userId)
            ->with(['wallet:id,name,color', 'category:id,name,color,icon'])
            ->orderByDesc('date')
            ->orderByDesc('created_at')
            ->limit($limit)
            ->get()
            ->map(fn ($t) => [
                'id'       => $t->id,
                'label'    => $t->label,
                'amount'   => $t->amount,
                'type'     => $t->type->value,
                'date'     => $t->date->toDateString(),
                'wallet'   => $t->wallet
                    ? ['id' => $t->wallet->id, 'name' => $t->wallet->name, 'color' => $t->wallet->color]
                    : null,
                'category' => $t->category
                    ? ['id' => $t->category->id, 'name' => $t->category->name, 'color' => $t->category->color, 'icon' => $t->category->icon]
                    : null,
            ])
            ->all();
    }

    // ── Tendance mensuelle ─────────────────────────────────────────────────

    private function monthlyTrend(int $userId, int $months): array
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
                 SUM(amount) AS total"
            )
            ->groupByRaw('EXTRACT(YEAR FROM date), EXTRACT(MONTH FROM date), type')
            ->get()
            ->groupBy(fn ($r) => $r->year . '-' . $r->month);

        $result = [];
        for ($i = $months - 1; $i >= 0; $i--) {
            $d   = Carbon::now()->subMonths($i)->startOfMonth();
            $key = $d->year . '-' . $d->month;
            $grp = $rows->get($key, collect());

            $result[] = [
                'year'     => $d->year,
                'month'    => $d->month,
                'income'   => (int) ($grp->firstWhere('type', 'income')?->total  ?? 0),
                'expenses' => abs((int) ($grp->firstWhere('type', 'expense')?->total ?? 0)),
            ];
        }

        return $result;
    }
}
