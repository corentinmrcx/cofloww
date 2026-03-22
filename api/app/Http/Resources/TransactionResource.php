<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TransactionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                 => $this->id,
            'label'              => $this->label,
            'notes'              => $this->notes,
            'amount'             => $this->amount,
            'type'               => $this->type->value,
            'status'             => $this->status->value,
            'date'               => $this->date->toDateString(),
            'value_date'         => $this->value_date?->toDateString(),
            'is_recurring'       => $this->is_recurring,
            'recurring_rule_id'  => $this->recurring_rule_id,
            'metadata'           => $this->metadata,

            'wallet_id'          => $this->wallet_id,
            'category_id'        => $this->category_id,
            'to_wallet_id'       => $this->to_wallet_id,

            'wallet'    => $this->whenLoaded('wallet', fn () => [
                'id'    => $this->wallet->id,
                'name'  => $this->wallet->name,
                'color' => $this->wallet->color,
            ]),

            'category'  => $this->whenLoaded('category', fn () => $this->category ? [
                'id'    => $this->category->id,
                'name'  => $this->category->name,
                'color' => $this->category->color,
                'icon'  => $this->category->icon,
            ] : null),

            'to_wallet' => $this->whenLoaded('toWallet', fn () => $this->toWallet ? [
                'id'    => $this->toWallet->id,
                'name'  => $this->toWallet->name,
                'color' => $this->toWallet->color,
            ] : null),

            'tags' => $this->whenLoaded('tags', fn () => $this->tags->map(fn ($tag) => [
                'id'    => $tag->id,
                'name'  => $tag->name,
                'color' => $tag->color,
            ])),

            'created_at' => $this->created_at->toIso8601String(),
            'updated_at' => $this->updated_at->toIso8601String(),
        ];
    }
}
