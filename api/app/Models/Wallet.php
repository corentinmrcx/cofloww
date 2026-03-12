<?php

namespace App\Models;

use App\Enums\WalletType;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Wallet extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'user_id',
        'name',
        'slug',
        'type',
        'color',
        'icon',
        'institution',
        'is_default',
        'is_archived',
        'sort_order',
        'initial_balance',
        'balance_cache',
    ];

    protected function casts(): array
    {
        return [
            'type'            => WalletType::class,
            'is_default'      => 'boolean',
            'is_archived'     => 'boolean',
            'sort_order'      => 'integer',
            'initial_balance' => 'integer',
            'balance_cache'   => 'integer',
        ];
    }

    protected static function booted(): void
    {
        static::addGlobalScope('user', fn ($query) => $query->where('user_id', auth()->id()));
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    protected function balance(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->relationLoaded('transactions')
                ? $this->initial_balance + $this->transactions->sum('amount')
                : $this->initial_balance + $this->balance_cache,
        );
    }
}
