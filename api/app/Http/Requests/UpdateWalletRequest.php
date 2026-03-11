<?php

namespace App\Http\Requests;

use App\Enums\WalletType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateWalletRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'name'            => ['sometimes', 'string', 'max:100'],
            'type'            => ['sometimes', Rule::enum(WalletType::class)],
            'color'           => ['nullable', 'string', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'icon'            => ['nullable', 'string', 'max:50'],
            'institution'     => ['nullable', 'string', 'max:100'],
            'is_default'      => ['boolean'],
            'initial_balance' => ['numeric'],
            'sort_order'      => ['integer', 'min:0'],
        ];
    }
}
