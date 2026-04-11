<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ComputeInvestmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'wallet_id'   => [
                'required',
                Rule::exists('wallets', 'id')
                    ->where('user_id', $this->user()->id)
                    ->where('is_archived', 0),
            ],
            'seuil'       => ['required', 'integer', 'min:0'],
            'pas_arrondi' => ['required', 'integer', 'min:1'],
            'month'       => ['sometimes', 'integer', 'min:1', 'max:12'],
            'year'        => ['sometimes', 'integer', 'min:2000', 'max:2100'],
        ];
    }
}
