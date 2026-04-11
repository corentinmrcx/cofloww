<?php

namespace App\Services;

use App\Enums\TransactionStatus;
use App\Enums\TransactionType;
use App\Models\Transaction;
use App\Models\Wallet;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class TransactionService
{
    public function index(array $filters): LengthAwarePaginator
    {
        return Transaction::with(['wallet', 'category', 'tags'])
            ->when($filters['wallet_id'] ?? null, fn ($q, $v) => $q->byWallet($v))
            ->when($filters['category_id'] ?? null, fn ($q, $v) => $q->byCategory($v))
            ->when($filters['tag_id'] ?? null, fn ($q, $v) => $q->whereHas('tags', fn ($tq) => $tq->where('tags.id', $v)))
            ->when($filters['type'] ?? null, fn ($q, $v) => $q->byType(TransactionType::from($v)))
            ->when($filters['status'] ?? null, fn ($q, $v) => $q->byStatus(TransactionStatus::from($v)))
            ->when($filters['date_from'] ?? null, fn ($q, $v) => $q->where('date', '>=', $v))
            ->when($filters['date_to'] ?? null, fn ($q, $v) => $q->where('date', '<=', $v))
            ->when($filters['search'] ?? null, fn ($q, $v) => $q->whereRaw('LOWER(label) LIKE LOWER(?)', ["%{$v}%"]))
            ->orderBy('date', 'desc')
            ->orderBy('created_at', 'desc')
            ->paginate($filters['per_page'] ?? 25);
    }

    public function forExport(array $filters): Builder
    {
        return Transaction::with(['wallet', 'category'])
            ->when($filters['wallet_id'] ?? null, fn ($q, $v) => $q->byWallet($v))
            ->when($filters['category_id'] ?? null, fn ($q, $v) => $q->byCategory($v))
            ->when($filters['tag_id'] ?? null, fn ($q, $v) => $q->whereHas('tags', fn ($tq) => $tq->where('tags.id', $v)))
            ->when($filters['type'] ?? null, fn ($q, $v) => $q->byType(TransactionType::from($v)))
            ->when($filters['status'] ?? null, fn ($q, $v) => $q->byStatus(TransactionStatus::from($v)))
            ->when($filters['date_from'] ?? null, fn ($q, $v) => $q->where('date', '>=', $v))
            ->when($filters['date_to'] ?? null, fn ($q, $v) => $q->where('date', '<=', $v))
            ->when($filters['search'] ?? null, fn ($q, $v) => $q->whereRaw('LOWER(label) LIKE LOWER(?)', ["%{$v}%"]))
            ->orderBy('date', 'desc')
            ->orderBy('created_at', 'desc');
    }

    public function store(array $data, int $userId): Transaction
    {
        return DB::transaction(function () use ($data, $userId) {
            $type = TransactionType::from($data['type']);

            $transaction = Transaction::create([
                ...$data,
                'user_id' => $userId,
                'amount'  => $this->applySign($data['amount'], $type),
                'tag_ids' => null, // non-fillable
            ]);

            if (!empty($data['tag_ids'])) {
                $transaction->tags()->sync($data['tag_ids']);
            }

            $this->recalculateCache($transaction->wallet_id);

            if ($type === TransactionType::Transfer && $transaction->to_wallet_id) {
                $this->recalculateCache($transaction->to_wallet_id);
            }

            return $transaction->load(['wallet', 'category', 'tags']);
        });
    }

    public function update(Transaction $transaction, array $data): Transaction
    {
        return DB::transaction(function () use ($transaction, $data) {
            $oldWalletId   = $transaction->wallet_id;
            $oldToWalletId = $transaction->to_wallet_id;

            $type = TransactionType::from($data['type'] ?? $transaction->type->value);

            if (isset($data['amount']) || isset($data['type'])) {
                $data['amount'] = $this->applySign(
                    $data['amount'] ?? abs($transaction->amount),
                    $type,
                );
            }

            $transaction->update($data);

            if (array_key_exists('tag_ids', $data)) {
                $transaction->tags()->sync($data['tag_ids'] ?? []);
            }

            $affectedWallets = array_filter(array_unique([
                $oldWalletId,
                $oldToWalletId,
                $transaction->wallet_id,
                $transaction->to_wallet_id,
            ]));

            foreach ($affectedWallets as $walletId) {
                $this->recalculateCache($walletId);
            }

            return $transaction->fresh(['wallet', 'category', 'tags']);
        });
    }

    public function destroy(Transaction $transaction): void
    {
        DB::transaction(function () use ($transaction) {
            $walletId   = $transaction->wallet_id;
            $toWalletId = $transaction->to_wallet_id;

            $transaction->delete();

            $this->recalculateCache($walletId);

            if ($toWalletId) {
                $this->recalculateCache($toWalletId);
            }
        });
    }

    public function bulkDestroy(array $ids, int $userId): void
    {
        DB::transaction(function () use ($ids, $userId) {
            $transactions = Transaction::withoutGlobalScopes()
                ->whereIn('id', $ids)
                ->where('user_id', $userId)
                ->get(['id', 'wallet_id', 'to_wallet_id']);

            abort_if($transactions->count() !== count($ids), 403, 'Some transactions do not belong to you.');

            $affectedWallets = $transactions
                ->flatMap(fn ($t) => array_filter([$t->wallet_id, $t->to_wallet_id]))
                ->unique()
                ->values();

            Transaction::withoutGlobalScopes()
                ->whereIn('id', $ids)
                ->where('user_id', $userId)
                ->delete();

            foreach ($affectedWallets as $walletId) {
                $this->recalculateCache($walletId);
            }
        });
    }

    public function recalculateCache(string $walletId): void
    {
        $direct = (int) DB::table('transactions')
            ->whereNull('deleted_at')
            ->where('wallet_id', $walletId)
            ->sum('amount');

        $incomingTransfers = (int) DB::table('transactions')
            ->whereNull('deleted_at')
            ->where('to_wallet_id', $walletId)
            ->where('type', TransactionType::Transfer->value)
            ->sum('amount');

        Wallet::withoutGlobalScopes()
            ->where('id', $walletId)
            ->update(['balance_cache' => $direct - $incomingTransfers]);
    }

    private function applySign(int $amount, TransactionType $type): int
    {
        return match ($type) {
            TransactionType::Income   =>  abs($amount),
            TransactionType::Expense  => -abs($amount),
            TransactionType::Transfer => -abs($amount),
        };
    }
}
