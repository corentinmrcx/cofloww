<?php

namespace App\Services;

use App\Models\MonthlySnapshot;
use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class SnapshotService
{
    /**
     * Calcule les données d'un mois pour un utilisateur.
     *
     * @return array{
     *   total_income: int,
     *   total_expenses: int,
     *   net: int,
     *   net_worth: int,
     *   savings_rate: float,
     *   wallet_balances: list<array{wallet_id:string, name:string, balance:int}>,
     *   categories_breakdown: list<array{category_id:string|null, name:string, amount:int}>
     * }
     */
    public function compute(int $userId, int $year, int $month): array
    {
        $start = Carbon::createFromDate($year, $month, 1)->startOfDay();
        $end   = $start->copy()->endOfMonth()->endOfDay();

        // ── Revenus & dépenses du mois ──────────────────────────────────────
        $agg = DB::table('transactions')
            ->where('user_id', $userId)
            ->whereNull('deleted_at')
            ->whereIn('type', ['income', 'expense'])
            ->whereBetween('date', [$start->toDateString(), $end->toDateString()])
            ->selectRaw(
                "SUM(CASE WHEN type = 'income'  THEN amount ELSE 0 END) AS income,
                 SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) AS expenses"
            )
            ->first();

        $totalIncome   = (int) ($agg?->income   ?? 0);
        $totalExpenses = abs((int) ($agg?->expenses ?? 0));
        $net           = $totalIncome - $totalExpenses;
        $savingsRate   = $totalIncome > 0
            ? round($net / $totalIncome * 100, 2)
            : 0.0;

        // ── Net worth : solde de chaque wallet à la fin du mois ────────────
        $wallets = DB::table('wallets')
            ->where('user_id', $userId)
            ->where('is_archived', 0)
            ->select('id', 'name', 'initial_balance')
            ->get();

        $txSumsByWallet = DB::table('transactions')
            ->where('user_id', $userId)
            ->whereNull('deleted_at')
            ->where('date', '<=', $end->toDateString())
            ->selectRaw('wallet_id, SUM(amount) AS total')
            ->groupBy('wallet_id')
            ->pluck('total', 'wallet_id');

        $walletBalances = $wallets->map(fn ($w) => [
            'wallet_id' => $w->id,
            'name'      => $w->name,
            'balance'   => (int) $w->initial_balance + (int) ($txSumsByWallet[$w->id] ?? 0),
        ])->all();

        $netWorth = array_sum(array_column($walletBalances, 'balance'));

        // ── Répartition par catégorie ───────────────────────────────────────
        $catBreakdown = DB::table('transactions as t')
            ->leftJoin('categories as c', 't.category_id', '=', 'c.id')
            ->where('t.user_id', $userId)
            ->whereNull('t.deleted_at')
            ->where('t.type', 'expense')
            ->whereBetween('t.date', [$start->toDateString(), $end->toDateString()])
            ->selectRaw("t.category_id, c.name, ABS(SUM(t.amount)) AS total")
            ->groupBy('t.category_id', 'c.name')
            ->orderByDesc('total')
            ->get()
            ->map(fn ($r) => [
                'category_id' => $r->category_id,
                'name'        => $r->name ?? 'Sans catégorie',
                'amount'      => (int) $r->total,
            ])
            ->all();

        return [
            'total_income'         => $totalIncome,
            'total_expenses'       => $totalExpenses,
            'net'                  => $net,
            'net_worth'            => $netWorth,
            'savings_rate'         => $savingsRate,
            'wallet_balances'      => $walletBalances,
            'categories_breakdown' => $catBreakdown,
        ];
    }

    /**
     * Calcule et persiste le snapshot du mois précédent pour tous les utilisateurs.
     * Appelé le 1er du mois à 01h00.
     */
    public function computeAndPersistPreviousMonth(): void
    {
        $prev = Carbon::now()->subMonth();

        User::query()->each(function (User $user) use ($prev) {
            $this->persistForUser($user->id, $prev->year, $prev->month);
        });
    }

    /**
     * Calcule et persiste (ou met à jour) le snapshot d'un utilisateur pour un mois donné.
     */
    public function persistForUser(int $userId, int $year, int $month): MonthlySnapshot
    {
        $data = $this->compute($userId, $year, $month);

        return MonthlySnapshot::withoutGlobalScopes()->updateOrCreate(
            ['user_id' => $userId, 'year' => $year, 'month' => $month],
            $data,
        );
    }
}
