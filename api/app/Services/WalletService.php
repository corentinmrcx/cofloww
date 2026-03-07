<?php

namespace App\Services;

use App\Models\Wallet;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class WalletService
{
    public function store(array $data, int $userId): Wallet
    {
        return DB::transaction(function () use ($data, $userId) {
            if (!empty($data['is_default'])) {
                Wallet::query()->update(['is_default' => false]);
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
                Wallet::query()->update(['is_default' => false]);
            }

            if (isset($data['name'])) {
                $data['slug'] = $this->uniqueSlug($data['name'], $wallet->user_id, $wallet->id);
            }

            $wallet->update($data);

            return $wallet->fresh();
        });
    }

    public function archive(Wallet $wallet): void
    {
        $wallet->update(['is_archived' => true]);
    }

    public function reorder(array $items): void
    {
        DB::transaction(function () use ($items) {
            foreach ($items as $item) {
                Wallet::withoutGlobalScopes()
                    ->where('id', $item['id'])
                    ->update(['sort_order' => $item['sort_order']]);
            }
        });
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
