<?php

namespace App\Models;

use App\Enums\BudgetPeriod;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Budget extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'user_id',
        'amount',
        'period',
        'month',
        'year',
        'alert_threshold_pct',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'period'              => BudgetPeriod::class,
            'amount'              => 'integer',
            'month'               => 'integer',
            'year'                => 'integer',
            'alert_threshold_pct' => 'integer',
            'is_active'           => 'boolean',
        ];
    }

    protected static function booted(): void
    {
        static::addGlobalScope('user', fn ($query) => $query->where('budgets.user_id', auth()->id()));
    }

    // — Relations —

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function categories(): BelongsToMany
    {
        return $this->belongsToMany(Category::class);
    }
}
