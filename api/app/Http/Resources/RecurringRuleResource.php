<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RecurringRuleResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                  => $this->id,
            'label'               => $this->label,
            'amount'              => $this->amount,
            'type'                => $this->type->value,
            'frequency'           => $this->frequency->value,
            'day_of_month'        => $this->day_of_month,
            'day_of_week'         => $this->day_of_week,
            'starts_at'           => $this->starts_at->toDateString(),
            'ends_at'             => $this->ends_at?->toDateString(),
            'last_generated_at'   => $this->last_generated_at?->toDateString(),
            'is_active'           => $this->is_active,
            'next_occurrence'     => $this->nextOccurrence()?->toDateString(),

            'wallet_id'           => $this->wallet_id,
            'category_id'         => $this->category_id,

            'wallet'   => $this->whenLoaded('wallet', fn () => [
                'id'    => $this->wallet->id,
                'name'  => $this->wallet->name,
                'color' => $this->wallet->color,
            ]),

            'category' => $this->whenLoaded('category', fn () => $this->category ? [
                'id'    => $this->category->id,
                'name'  => $this->category->name,
                'color' => $this->category->color,
                'icon'  => $this->category->icon,
            ] : null),

            'created_at' => $this->created_at->toIso8601String(),
            'updated_at' => $this->updated_at->toIso8601String(),
        ];
    }
}
