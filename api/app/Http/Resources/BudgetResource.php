<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BudgetResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                  => $this->id,
            'amount'              => $this->amount,
            'period'              => $this->period->value,
            'month'               => $this->month,
            'year'                => $this->year,
            'alert_threshold_pct' => $this->alert_threshold_pct,
            'is_active'           => $this->is_active,

            // Calculés par BudgetService
            'spent'     => $this->spent     ?? 0,
            'remaining' => $this->remaining ?? $this->amount,
            'pct_used'  => $this->pct_used  ?? 0,
            'alert'     => $this->alert     ?? false,

            'categories' => $this->whenLoaded('categories', fn () => $this->categories->map(fn ($c) => [
                'id'    => $c->id,
                'name'  => $c->name,
                'color' => $c->color,
                'icon'  => $c->icon,
            ])),

            'created_at' => $this->created_at->toIso8601String(),
            'updated_at' => $this->updated_at->toIso8601String(),
        ];
    }
}
