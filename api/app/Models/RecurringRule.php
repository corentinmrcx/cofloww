<?php

namespace App\Models;

use App\Enums\RecurringFrequency;
use App\Enums\TransactionType;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

class RecurringRule extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'user_id',
        'wallet_id',
        'category_id',
        'label',
        'amount',
        'type',
        'frequency',
        'day_of_month',
        'day_of_week',
        'starts_at',
        'ends_at',
        'last_generated_at',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'type'               => TransactionType::class,
            'frequency'          => RecurringFrequency::class,
            'starts_at'          => 'date',
            'ends_at'            => 'date',
            'last_generated_at'  => 'date',
            'is_active'          => 'boolean',
            'amount'             => 'integer',
            'day_of_month'       => 'integer',
            'day_of_week'        => 'integer',
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

    // — Logique métier —

    public function nextOccurrence(): ?Carbon
    {
        if (! $this->last_generated_at) {
            $next = $this->starts_at->copy();
        } else {
            $next = match ($this->frequency) {
                RecurringFrequency::Daily   => $this->last_generated_at->copy()->addDay(),
                RecurringFrequency::Weekly  => $this->last_generated_at->copy()->addWeek(),
                RecurringFrequency::Monthly => $this->nextMonthlyDate(),
                RecurringFrequency::Yearly  => $this->last_generated_at->copy()->addYear(),
            };
        }

        if ($this->ends_at && $next->gt($this->ends_at)) {
            return null;
        }

        return $next;
    }

    private function nextMonthlyDate(): Carbon
    {
        $next = $this->last_generated_at->copy()->addMonthNoOverflow();

        if ($this->day_of_month) {
            $next->day(min($this->day_of_month, $next->daysInMonth));
        }

        return $next;
    }
}
