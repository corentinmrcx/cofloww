<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class GoalResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'         => $this->id,
            'name'       => $this->name,
            'color'      => $this->color,
            'start_date' => $this->start_date->toDateString(),
            'end_date'   => $this->end_date?->toDateString(),
            'is_active'  => $this->is_active,

            'total_target'   => $this->total_target,
            'monthly_target' => $this->monthly_target,

            // Calculés par GoalService
            'transferred_total'      => $this->transferred_total      ?? 0,
            'transferred_this_month' => $this->transferred_this_month ?? 0,
            'pct_total'              => $this->pct_total              ?? null,
            'pct_monthly'            => $this->pct_monthly            ?? null,
            'is_active_this_month'   => $this->is_active_this_month   ?? false,

            'wallet' => $this->whenLoaded('wallet', fn () => [
                'id'          => $this->wallet->id,
                'name'        => $this->wallet->name,
                'institution' => $this->wallet->institution,
                'color'       => $this->wallet->color,
            ]),

            'created_at' => $this->created_at->toIso8601String(),
            'updated_at' => $this->updated_at->toIso8601String(),
        ];
    }
}
