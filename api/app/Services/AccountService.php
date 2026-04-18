<?php

namespace App\Services;

use App\Models\Budget;
use App\Models\Category;
use App\Models\RecurringRule;
use App\Models\Tag;
use App\Models\Transaction;
use App\Models\Wallet;
use App\Models\User;

class AccountService
{
    public function export(User $user): array
    {
        return [
            'exported_at'  => now()->toIso8601String(),
            'user'         => [
                'firstname' => $user->firstname,
                'lastname'  => $user->lastname,
                'email'     => $user->email,
                'currency'  => $user->currency,
                'timezone'  => $user->timezone,
                'settings'  => $user->settings,
            ],
            'wallets' => Wallet::withoutGlobalScopes()
                ->where('user_id', $user->id)
                ->get(['id', 'name', 'type', 'initial_balance', 'balance_cache', 'is_archived', 'created_at']),
            'categories' => Category::withoutGlobalScopes()
                ->where('user_id', $user->id)
                ->get(['id', 'name', 'type', 'color', 'icon', 'parent_id']),
            'tags' => Tag::withoutGlobalScopes()
                ->where('user_id', $user->id)
                ->get(['id', 'name', 'color']),
            'transactions' => Transaction::withoutGlobalScopes()
                ->where('user_id', $user->id)
                ->whereNull('deleted_at')
                ->get(['id', 'wallet_id', 'category_id', 'label', 'amount', 'type', 'date', 'status']),
            'budgets' => Budget::withoutGlobalScopes()
                ->where('user_id', $user->id)
                ->with('categories:id,name')
                ->get(['id', 'amount', 'period', 'month', 'year', 'alert_threshold_pct', 'is_active']),
            'recurring_rules' => RecurringRule::withoutGlobalScopes()
                ->where('user_id', $user->id)
                ->get(),
        ];
    }
}
