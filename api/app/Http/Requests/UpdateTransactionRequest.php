<?php

namespace App\Http\Requests;

use App\Enums\TransactionStatus;
use App\Enums\TransactionType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateTransactionRequest extends FormRequest
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
            'to_wallet_id' => [
                'nullable', 'uuid',
                Rule::exists('wallets', 'id')->where('user_id', $userId),
                'different:wallet_id',
            ],
            'tag_ids'      => ['nullable', 'array'],
            'tag_ids.*'    => ['uuid', Rule::exists('tags', 'id')->where('user_id', $userId)],

            'label'        => ['sometimes', 'string', 'max:255'],
            'notes'        => ['nullable', 'string'],
            'amount'       => ['sometimes', 'integer', 'min:1'],
            'type'         => ['sometimes', Rule::enum(TransactionType::class)],
            'date'         => ['sometimes', 'date'],
            'value_date'   => ['nullable', 'date'],
            'is_recurring' => ['boolean'],
            'status'       => ['nullable', Rule::enum(TransactionStatus::class)],
            'metadata'     => ['nullable', 'array'],
        ];
    }
}
