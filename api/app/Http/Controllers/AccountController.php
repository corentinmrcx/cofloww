<?php

namespace App\Http\Controllers;

use App\Models\Budget;
use App\Models\Category;
use App\Models\RecurringRule;
use App\Models\Tag;
use App\Models\Transaction;
use App\Models\Wallet;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AccountController extends Controller
{
    public function export(Request $request): JsonResponse
    {
        $user = $request->user();

        $data = [
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
                ->get(['id', 'wallet_id', 'category_id', 'label', 'amount', 'type', 'date', 'status']),
            'budgets' => Budget::withoutGlobalScopes()
                ->where('user_id', $user->id)
                ->with('categories:id,name')
                ->get(['id', 'amount', 'period', 'month', 'year', 'alert_threshold_pct', 'is_active']),
            'recurring_rules' => RecurringRule::withoutGlobalScopes()
                ->where('user_id', $user->id)
                ->get(),
        ];

        return response()->json($data)->header('Content-Disposition', 'attachment; filename="cofloww-export.json"');
    }

    public function destroy(Request $request): JsonResponse
    {
        $request->validate([
            'password' => ['required', 'string', 'current_password'],
        ]);

        $user = $request->user();

        DB::transaction(function () use ($user) {
            $user->tokens()->delete();
            $user->delete();
        });

        return response()->json(['message' => 'Compte supprimé.']);
    }

    public function logoutAll(Request $request): JsonResponse
    {
        $request->user()->tokens()->delete();

        return response()->json(['message' => 'Tous les appareils ont été déconnectés.']);
    }
}
