<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateGoalRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'wallet_id'      => ['sometimes', 'uuid', 'exists:wallets,id'],
            'name'           => ['sometimes', 'string', 'max:100'],
            'color'          => ['nullable', 'string', 'max:20'],
            'start_date'     => ['sometimes', 'date'],
            'end_date'       => ['nullable', 'date'],
            'total_target'   => ['nullable', 'integer', 'min:1'],
            'monthly_target' => ['nullable', 'integer', 'min:1'],
            'is_active'      => ['sometimes', 'boolean'],
        ];
    }
}
