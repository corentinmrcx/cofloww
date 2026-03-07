<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class WalletResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'              => $this->id,
            'name'            => $this->name,
            'slug'            => $this->slug,
            'type'            => $this->type->value,
            'color'           => $this->color,
            'icon'            => $this->icon,
            'institution'     => $this->institution,
            'is_default'      => $this->is_default,
            'is_archived'     => $this->is_archived,
            'sort_order'      => $this->sort_order,
            'initial_balance' => $this->initial_balance,
            'balance'         => $this->balance,
            'created_at'      => $this->created_at,
            'updated_at'      => $this->updated_at,
        ];
    }
}
