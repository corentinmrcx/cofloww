<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InvestmentPocket extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'user_id',
        'wallet_id',
        'name',
        'target_pct',
        'color',
        'icon',
        'description',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'target_pct' => 'float',
            'sort_order' => 'integer',
        ];
    }

    protected static function booted(): void
    {
        static::addGlobalScope('user', fn ($q) => $q->where('investment_pockets.user_id', auth()->id()));
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function wallet(): BelongsTo
    {
        return $this->belongsTo(Wallet::class);
    }
}
