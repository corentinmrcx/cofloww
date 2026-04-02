<?php

namespace App\Http\Requests;

use App\Enums\RecurringFrequency;
use App\Enums\TransactionType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreRecurringRuleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        $userId = $this->user()->id;

        return [
            'wallet_id'    => ['required', 'uuid', Rule::exists('wallets', 'id')->where('user_id', $userId)],
            'category_id'  => ['nullable', 'uuid', Rule::exists('categories', 'id')->where(
                fn ($q) => $q->where('user_id', $userId)->orWhereNull('user_id')
            )],

            'label'        => ['required', 'string', 'max:255'],
            'amount'       => ['required', 'integer', 'min:1'],
            'type'         => ['required', Rule::enum(TransactionType::class)],

            'frequency'    => ['required', Rule::enum(RecurringFrequency::class)],
            'day_of_month' => ['nullable', 'integer', 'min:1', 'max:31'],
            'day_of_week'  => ['nullable', 'integer', 'min:0', 'max:6'],

            'starts_at'    => ['required', 'date'],
            'ends_at'      => ['nullable', 'date', 'after:starts_at'],
            'is_active'    => ['boolean'],
        ];
    }
}
