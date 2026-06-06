<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreGoalRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'wallet_id'      => ['required', 'uuid', 'exists:wallets,id'],
            'name'           => ['required', 'string', 'max:100'],
            'color'          => ['nullable', 'string', 'max:20'],
            'start_date'     => ['required', 'date'],
            'end_date'       => ['nullable', 'date', 'after_or_equal:start_date'],
            'total_target'   => ['nullable', 'integer', 'min:1'],
            'monthly_target' => ['nullable', 'integer', 'min:1'],
            'is_active'      => ['boolean'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($v) {
            if (empty($this->total_target) && empty($this->monthly_target)) {
                $v->errors()->add('total_target', 'Au moins un objectif (total ou mensuel) est requis.');
            }
        });
    }
}
