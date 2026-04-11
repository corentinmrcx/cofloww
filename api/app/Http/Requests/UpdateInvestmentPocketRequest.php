<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateInvestmentPocketRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'name'        => ['sometimes', 'string', 'max:255'],
            'target_pct'  => ['sometimes', 'numeric', 'min:0.01', 'max:100'],
            'color'       => ['sometimes', 'string'],
            'icon'        => ['sometimes', 'nullable', 'string'],
            'description' => ['sometimes', 'nullable', 'string', 'max:500'],
            'sort_order'  => ['sometimes', 'integer', 'min:0'],
            'wallet_id'   => [
                'sometimes',
                'nullable',
                'uuid',
                Rule::exists('wallets', 'id')->where('user_id', $this->user()->id),
            ],
        ];
    }
}
