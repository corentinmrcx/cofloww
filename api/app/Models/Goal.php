<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Goal extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    protected $fillable = [
        'user_id',
        'wallet_id',
        'name',
        'color',
        'start_date',
        'end_date',
        'total_target',
        'monthly_target',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'start_date'     => 'date',
            'end_date'       => 'date',
            'total_target'   => 'integer',
            'monthly_target' => 'integer',
            'is_active'      => 'boolean',
        ];
    }

    protected static function booted(): void
    {
        static::addGlobalScope('user', fn ($query) => $query->where('goals.user_id', auth()->id()));
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
