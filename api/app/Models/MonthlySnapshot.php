<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MonthlySnapshot extends Model
{
    use HasUuids;

    protected $fillable = [
        'user_id',
        'year',
        'month',
        'total_income',
        'total_expenses',
        'net',
        'net_worth',
        'savings_rate',
        'wallet_balances',
        'categories_breakdown',
    ];

    protected function casts(): array
    {
        return [
            'year'                 => 'integer',
            'month'                => 'integer',
            'total_income'         => 'integer',
            'total_expenses'       => 'integer',
            'net'                  => 'integer',
            'net_worth'            => 'integer',
            'savings_rate'         => 'float',
            'wallet_balances'      => 'array',
            'categories_breakdown' => 'array',
        ];
    }

    protected static function booted(): void
    {
        static::addGlobalScope('user', fn ($q) => $q->where('user_id', auth()->id()));
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
