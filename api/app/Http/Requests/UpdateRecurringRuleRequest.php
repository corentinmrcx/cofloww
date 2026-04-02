<?php

namespace App\Http\Requests;

use App\Enums\RecurringFrequency;
use App\Enums\TransactionType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateRecurringRuleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        $userId = $this->user()->id;

        return [
            'wallet_id'    => ['sometimes', 'uuid', Rule::exists('wallets', 'id')->where('user_id', $userId)],
            'category_id'  => ['nullable', 'uuid', Rule::exists('categories', 'id')->where(
                fn ($q) => $q->where('user_id', $userId)->orWhereNull('user_id')
            )],

            'label'        => ['sometimes', 'string', 'max:255'],
            'amount'       => ['sometimes', 'integer', 'min:1'],
            'type'         => ['sometimes', Rule::enum(TransactionType::class)],

            'frequency'    => ['sometimes', Rule::enum(RecurringFrequency::class)],
            'day_of_month' => ['nullable', 'integer', 'min:1', 'max:31'],
            'day_of_week'  => ['nullable', 'integer', 'min:0', 'max:6'],

            'starts_at'    => ['sometimes', 'date'],
            'ends_at'      => ['nullable', 'date', 'after:starts_at'],
            'is_active'    => ['sometimes', 'boolean'],
        ];
    }
}
