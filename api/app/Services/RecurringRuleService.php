<?php

namespace App\Services;

use App\Models\RecurringRule;
use Illuminate\Pagination\LengthAwarePaginator;

class RecurringRuleService
{
    public function index(int $userId): LengthAwarePaginator
    {
        return RecurringRule::where('user_id', $userId)
            ->with(['wallet', 'category', 'tags'])
            ->orderBy('created_at', 'desc')
            ->paginate(25);
    }

    public function store(array $data, int $userId): RecurringRule
    {
        $rule = RecurringRule::create([...$data, 'user_id' => $userId, 'tag_ids' => null]);

        if (!empty($data['tag_ids'])) {
            $rule->tags()->sync($data['tag_ids']);
        }

        return $rule->load(['wallet', 'category', 'tags']);
    }

    public function update(RecurringRule $rule, array $data): RecurringRule
    {
        $rule->update($data);

        if (array_key_exists('tag_ids', $data)) {
            $rule->tags()->sync($data['tag_ids'] ?? []);
        }

        return $rule->fresh(['wallet', 'category', 'tags']);
    }

    public function destroy(RecurringRule $rule): void
    {
        $rule->delete();
    }
}
