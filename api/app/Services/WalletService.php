<?php

namespace App\Services;

use App\Models\Wallet;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use App\Services\TransactionService;

class WalletService
{
    public function store(array $data, int $userId): Wallet
    {
        return DB::transaction(function () use ($data, $userId) {
            if (!empty($data['is_default'])) {
                $this->clearDefault($userId);
            }

            return Wallet::create([
                ...$data,
                'user_id' => $userId,
                'slug'    => $this->uniqueSlug($data['name'], $userId),
            ]);
        });
    }

    public function update(Wallet $wallet, array $data): Wallet
    {
        return DB::transaction(function () use ($wallet, $data) {
            if (!empty($data['is_default'])) {
                $this->clearDefault($wallet->user_id);
            }

            if (isset($data['name'])) {
                $data['slug'] = $this->uniqueSlug($data['name'], $wallet->user_id, $wallet->id);
            }

            $wallet->update($data);

            return $wallet->fresh();
        });
    }

    public function adjust(Wallet $wallet, int $targetBalance, int $userId): void
    {
        $diff = $targetBalance - $wallet->balance;

        if ($diff === 0) {
            return;
        }

        app(TransactionService::class)->store([
            'wallet_id' => $wallet->id,
            'label'     => 'Ajustement de solde',
            'amount'    => abs($diff),
            'type'      => $diff > 0 ? 'income' : 'expense',
            'date'      => now()->toDateString(),
            'status'    => 'cleared',
        ], $userId);
    }

    public function archive(Wallet $wallet): void
    {
        $wallet->update(['is_archived' => true]);
    }

    public function reorder(int $userId, array $items): void
    {
        DB::transaction(function () use ($userId, $items) {
            foreach ($items as $item) {
                Wallet::withoutGlobalScopes()
                    ->where('user_id', $userId)
                    ->where('id', $item['id'])
                    ->update(['sort_order' => $item['sort_order']]);
            }
        });
    }

    private function clearDefault(int $userId): void
    {
        Wallet::withoutGlobalScopes()
            ->where('user_id', $userId)
            ->update(['is_default' => false]);
    }

    private function uniqueSlug(string $name, int $userId, ?string $excludeId = null): string
    {
        $base  = Str::slug($name);
        $slug  = $base;
        $count = 1;

        while (
            Wallet::withoutGlobalScopes()
                ->where('user_id', $userId)
                ->where('slug', $slug)
                ->when($excludeId, fn ($q) => $q->where('id', '!=', $excludeId))
                ->exists()
        ) {
            $slug = "{$base}-{$count}";
            $count++;
        }

        return $slug;
    }
}
