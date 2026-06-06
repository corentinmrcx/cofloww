<?php

namespace App\Services;

use App\Models\Goal;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class GoalService
{
    public function index(int $userId): Collection
    {
        $goals = Goal::with('wallet')
            ->where('goals.user_id', $userId)
            ->where('is_active', true)
            ->orderBy('start_date', 'desc')
            ->get();

        return $this->withProgress($goals, $userId);
    }

    public function store(array $data, int $userId): Goal
    {
        $goal = Goal::create([...$data, 'user_id' => $userId]);

        return $this->withProgress(
            new Collection([$goal->load('wallet')]),
            $userId
        )->first();
    }

    public function update(Goal $goal, array $data): Goal
    {
        $goal->update($data);

        return $this->withProgress(
            new Collection([$goal->fresh('wallet')]),
            $goal->user_id
        )->first();
    }

    public function destroy(Goal $goal): void
    {
        $goal->delete();
    }

    private function withProgress(Collection $goals, int $userId): Collection
    {
        if ($goals->isEmpty()) {
            return $goals;
        }

        $now     = Carbon::now();
        $goalIds = $goals->pluck('id')->all();

        $allTransfers = DB::table('transactions')
            ->where('user_id', $userId)
            ->where('type', 'transfer')
            ->whereNull('deleted_at')
            ->whereIn('goal_id', $goalIds)
            ->select('goal_id', 'date', DB::raw('ABS(amount) AS amount'))
            ->get();

        $goals->each(function (Goal $goal) use ($allTransfers, $now): void {
            $endDate = $goal->end_date ?? $now->copy()->endOfDay();

            $forGoal = $allTransfers
                ->where('goal_id', $goal->id)
                ->filter(fn ($t) => $t->date >= $goal->start_date->toDateString()
                    && $t->date <= $endDate->toDateString());

            $goal->transferred_total = (int) $forGoal->sum('amount');

            // Progression mensuelle (mois courant uniquement)
            $monthStart = $now->copy()->startOfMonth()->toDateString();
            $monthEnd   = $now->copy()->endOfMonth()->toDateString();

            $goal->transferred_this_month = (int) $forGoal
                ->filter(fn ($t) => $t->date >= $monthStart && $t->date <= $monthEnd)
                ->sum('amount');

            $goal->pct_total = $goal->total_target > 0
                ? round(min($goal->transferred_total / $goal->total_target * 100, 100), 1)
                : null;

            $goal->pct_monthly = $goal->monthly_target > 0
                ? round(min($goal->transferred_this_month / $goal->monthly_target * 100, 100), 1)
                : null;

            // L'objectif est-il actif ce mois-ci ?
            $goal->is_active_this_month = $goal->start_date->lte($now->copy()->endOfMonth())
                && ($goal->end_date === null || $goal->end_date->gte($now->copy()->startOfMonth()));
        });

        return $goals;
    }
}
