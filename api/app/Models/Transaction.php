<?php

namespace App\Models;

use App\Enums\TransactionStatus;
use App\Enums\TransactionType;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Transaction extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    protected $attributes = [
        'status'       => 'cleared',
        'is_recurring' => false,
    ];

    protected $fillable = [
        'user_id',
        'wallet_id',
        'category_id',
        'to_wallet_id',
        'label',
        'notes',
        'amount',
        'type',
        'date',
        'value_date',
        'is_recurring',
        'recurring_rule_id',
        'status',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'type'         => TransactionType::class,
            'status'       => TransactionStatus::class,
            'date'         => 'date',
            'value_date'   => 'date',
            'is_recurring' => 'boolean',
            'amount'       => 'integer',
            'metadata'     => 'array',
        ];
    }

    protected static function booted(): void
    {
        static::addGlobalScope('user', fn ($query) => $query->where('user_id', auth()->id()));
    }

    // — Relations —

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function wallet(): BelongsTo
    {
        return $this->belongsTo(Wallet::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function toWallet(): BelongsTo
    {
        return $this->belongsTo(Wallet::class, 'to_wallet_id');
    }

    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(Tag::class, 'transaction_tag');
    }

    // — Scopes —

    public function scopeByWallet(Builder $query, string $walletId): Builder
    {
        return $query->where('wallet_id', $walletId);
    }

    public function scopeByCategory(Builder $query, string $categoryId): Builder
    {
        return $query->where('category_id', $categoryId);
    }

    public function scopeByType(Builder $query, TransactionType $type): Builder
    {
        return $query->where('type', $type);
    }

    public function scopeByDateRange(Builder $query, string $from, string $to): Builder
    {
        return $query->whereBetween('date', [$from, $to]);
    }

    public function scopeByStatus(Builder $query, TransactionStatus $status): Builder
    {
        return $query->where('status', $status);
    }
}
