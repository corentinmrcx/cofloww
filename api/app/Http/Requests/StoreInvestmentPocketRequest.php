<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreInvestmentPocketRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'name'        => ['required', 'string', 'max:255'],
            'target_pct'  => ['required', 'numeric', 'min:0.01', 'max:100'],
            'color'       => ['sometimes', 'string'],
            'icon'        => ['nullable', 'string'],
            'description' => ['nullable', 'string', 'max:500'],
            'sort_order'  => ['sometimes', 'integer', 'min:0'],
            'wallet_id'   => [
                'nullable',
                'uuid',
                Rule::exists('wallets', 'id')->where('user_id', $this->user()->id),
            ],
        ];
    }
}
