<?php

namespace App\Services;

use App\Models\AppNotification;
use App\Models\Budget;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class NotificationService
{
    /**
     * Crée une notification pour un utilisateur.
     */
    public function create(int $userId, string $type, string $title, ?string $body = null, ?array $data = null): AppNotification
    {
        return AppNotification::withoutGlobalScopes()->create([
            'user_id' => $userId,
            'type'    => $type,
            'title'   => $title,
            'body'    => $body,
            'data'    => $data,
        ]);
    }

    /**
     * Vérifie les alertes budgétaires après une modification de transaction.
     * Crée une notification si un budget dépasse son seuil d'alerte (une seule fois par mois).
     */
    public function checkBudgetAlerts(int $userId): void
    {
        $now = Carbon::now();

        $budgets = Budget::withoutGlobalScopes()
            ->where('user_id', $userId)
            ->where('period', 'monthly')
            ->where('month', $now->month)
            ->where('year', $now->year)
            ->where('is_active', true)
            ->where('amount', '>', 0)
            ->whereNotNull('alert_threshold_pct')
            ->with('categories:id,name')
            ->get();

        if ($budgets->isEmpty()) return;

        $catIds = $budgets->flatMap(fn ($b) => $b->categories->pluck('id'))->unique()->all();
        if (empty($catIds)) return;

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

        foreach ($budgets as $budget) {
            $spent = $budget->categories->sum(fn ($c) => (int) ($spending[$c->id] ?? 0));
            $pct   = $budget->amount > 0 ? ($spent / $budget->amount * 100) : 0;

            if ($pct < $budget->alert_threshold_pct) continue;

            $label = $budget->categories->first()?->name ?? 'Budget';

            // N'envoyer qu'une seule alerte par budget par mois
            $alreadyNotified = AppNotification::withoutGlobalScopes()
                ->where('user_id', $userId)
                ->where('type', 'budget_alert')
                ->whereJsonContains('data->budget_id', $budget->id)
                ->whereMonth('created_at', $now->month)
                ->whereYear('created_at', $now->year)
                ->exists();

            if ($alreadyNotified) continue;

            $this->create(
                userId: $userId,
                type:   'budget_alert',
                title:  "Budget « {$label} » atteint",
                body:   sprintf(
                    'Vous avez dépensé %s %% de votre budget %s (seuil : %s %%).',
                    round($pct, 0),
                    $label,
                    $budget->alert_threshold_pct,
                ),
                data: ['budget_id' => $budget->id, 'pct' => round($pct, 1)],
            );
        }
    }

    /**
     * Notification de confirmation d'import.
     */
    public function importSuccess(int $userId, int $count): void
    {
        $this->create(
            userId: $userId,
            type:   'import_success',
            title:  'Import terminé',
            body:   "{$count} transaction" . ($count > 1 ? 's importées' : ' importée') . ' avec succès.',
            data:   ['count' => $count],
        );
    }
}
