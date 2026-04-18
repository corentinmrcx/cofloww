<?php

namespace App\Services;

use App\Enums\BudgetPeriod;
use App\Models\Budget;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class BudgetService
{
    public function index(int $userId, ?int $month = null, ?int $year = null): Collection
    {
        $budgets = Budget::with('categories')
            ->where('budgets.user_id', $userId)
            ->when($year !== null, fn ($q) => $q->where(fn ($q2) => $q2
                ->where(fn ($q3) => $q3
                    ->where('period', 'monthly')
                    ->where('year', $year)
                    ->when($month !== null, fn ($q4) => $q4->where('month', $month))
                )
                ->orWhere(fn ($q3) => $q3
                    ->where('period', 'yearly')
                    ->where('year', $year)
                )
            ))
            ->orderBy('created_at', 'desc')
            ->get();

        return $this->withSpent($budgets, $userId);
    }

    public function store(array $data, int $userId): Budget
    {
        $categoryIds    = $data['category_ids'];
        $applyAllMonths = (bool) ($data['apply_all_months'] ?? false);
        unset($data['category_ids'], $data['apply_all_months']);

        $budget = DB::transaction(function () use ($data, $userId, $categoryIds, $applyAllMonths) {
            $budget = Budget::create([...$data, 'user_id' => $userId]);
            $budget->categories()->sync($categoryIds);

            if ($applyAllMonths && isset($data['month']) && $data['month'] !== null) {
                $fromMonth = (int) $data['month'];
                $year      = (int) $data['year'];
                for ($m = $fromMonth + 1; $m <= 12; $m++) {
                    $next = Budget::create([
                        ...$data,
                        'month'   => $m,
                        'year'    => $year,
                        'user_id' => $userId,
                    ]);
                    $next->categories()->sync($categoryIds);
                }
            }

            return $budget;
        });

        $collection = $this->withSpent(new Collection([$budget->load('categories')]), $userId);

        return $collection->first();
    }

    public function update(Budget $budget, array $data): Budget
    {
        if (isset($data['category_ids'])) {
            $budget->categories()->sync($data['category_ids']);
            unset($data['category_ids']);
        }

        if (!empty($data)) {
            $budget->update($data);
        }

        $collection = $this->withSpent(
            new Collection([$budget->fresh('categories')]),
            $budget->user_id,
        );

        return $collection->first();
    }

    public function destroy(Budget $budget): void
    {
        $budget->delete();
    }

    // — Calcul spent —

    private function withSpent(Collection $budgets, int $userId): Collection
    {
        if ($budgets->isEmpty()) {
            return $budgets;
        }

        $spentMap = $this->buildSpentMap($budgets, $userId);

        return $budgets->each(function (Budget $budget) use ($spentMap): void {
            $spent             = $spentMap[$budget->id] ?? 0;
            $budget->spent     = abs($spent);
            $budget->remaining = max(0, $budget->amount - $budget->spent);
            $budget->pct_used  = $budget->amount > 0
                ? round($budget->spent / $budget->amount * 100, 1)
                : 0;
            $budget->alert = $budget->spent >= ($budget->amount * $budget->alert_threshold_pct / 100);
        });
    }

    private function buildSpentMap(Collection $budgets, int $userId): array
    {
        $allCategoryIds = $budgets
            ->flatMap(fn (Budget $b) => $b->categories->pluck('id'))
            ->unique()
            ->values();

        if ($allCategoryIds->isEmpty()) {
            return [];
        }

        // Une seule requête pour toutes les catégories
        $rows = DB::table('transactions')
            ->select([
                'category_id',
                DB::raw('EXTRACT(YEAR  FROM date)::int AS yr'),
                DB::raw('EXTRACT(MONTH FROM date)::int AS mo'),
                DB::raw('SUM(amount) AS total'),
            ])
            ->where('user_id', $userId)
            ->where('type', 'expense')
            ->whereIn('category_id', $allCategoryIds)
            ->whereNull('deleted_at')
            ->groupBy('category_id', 'yr', 'mo')
            ->get();

        $byMonth = [];
        foreach ($rows as $row) {
            $byMonth[$row->category_id][$row->yr][$row->mo] = (int) $row->total;
        }

        $map = [];
        foreach ($budgets as $budget) {
            $total = 0;
            foreach ($budget->categories as $category) {
                $catData = $byMonth[$category->id] ?? [];
                if ($budget->period === BudgetPeriod::Monthly) {
                    $total += $catData[$budget->year][$budget->month] ?? 0;
                } else {
                    $yearData = $catData[$budget->year] ?? [];
                    $total += array_sum($yearData);
                }
            }
            $map[$budget->id] = $total;
        }

        return $map;
    }
}
