<?php

namespace App\Http\Requests;

use App\Enums\WalletType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreWalletRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name'            => ['required', 'string', 'max:100'],
            'type'            => ['required', Rule::enum(WalletType::class)],
            'color'           => ['nullable', 'string', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'icon'            => ['nullable', 'string', 'max:50'],
            'institution'     => ['nullable', 'string', 'max:100'],
            'is_default'      => ['boolean'],
            'initial_balance' => ['numeric'],
            'sort_order'      => ['integer', 'min:0'],
        ];
    }
}
