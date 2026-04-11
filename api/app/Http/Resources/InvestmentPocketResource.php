<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class InvestmentPocketResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'          => $this->id,
            'name'        => $this->name,
            'target_pct'  => $this->target_pct,
            'color'       => $this->color,
            'icon'        => $this->icon,
            'description' => $this->description,
            'sort_order'  => $this->sort_order,
            'wallet_id'   => $this->wallet_id,

            'wallet' => $this->whenLoaded('wallet', fn () => $this->wallet ? [
                'id'    => $this->wallet->id,
                'name'  => $this->wallet->name,
                'color' => $this->wallet->color,
            ] : null),

            'created_at' => $this->created_at->toIso8601String(),
            'updated_at' => $this->updated_at->toIso8601String(),
        ];
    }
}
