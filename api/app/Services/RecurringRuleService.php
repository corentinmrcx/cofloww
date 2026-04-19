<?php

namespace App\Services;

use App\Models\RecurringRule;
use Illuminate\Pagination\LengthAwarePaginator;

class RecurringRuleService
{
    public function index(int $userId): LengthAwarePaginator
    {
        return RecurringRule::where('user_id', $userId)
            ->with(['wallet', 'category'])
            ->orderBy('created_at', 'desc')
            ->paginate(25);
    }

    public function store(array $data, int $userId): RecurringRule
    {
        $rule = RecurringRule::create([...$data, 'user_id' => $userId]);

        return $rule->load(['wallet', 'category']);
    }

    public function update(RecurringRule $rule, array $data): RecurringRule
    {
        $rule->update($data);

        return $rule->fresh(['wallet', 'category']);
    }

    public function destroy(RecurringRule $rule): void
    {
        $rule->delete();
    }
}
