<?php

namespace App\Http\Requests;

use App\Enums\TransactionStatus;
use App\Enums\TransactionType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreTransactionRequest extends FormRequest
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
            'to_wallet_id' => [
                'nullable', 'uuid',
                Rule::exists('wallets', 'id')->where('user_id', $userId),
                'different:wallet_id',
                Rule::requiredIf(fn () => $this->input('type') === TransactionType::Transfer->value),
            ],
            'tag_ids'      => ['nullable', 'array'],
            'tag_ids.*'    => ['uuid', Rule::exists('tags', 'id')->where('user_id', $userId)],

            'label'        => ['required', 'string', 'max:255'],
            'notes'        => ['nullable', 'string'],
            'amount'       => ['required', 'integer', 'min:1'],
            'type'         => ['required', Rule::enum(TransactionType::class)],
            'date'         => ['required', 'date'],
            'value_date'   => ['nullable', 'date'],
            'is_recurring' => ['boolean'],
            'status'       => ['nullable', Rule::enum(TransactionStatus::class)],
            'metadata'     => ['nullable', 'array'],
        ];
    }
}
