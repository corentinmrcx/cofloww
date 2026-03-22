<?php

namespace App\Http\Requests;

use App\Enums\TransactionType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ConfirmImportRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        $userId = $this->user()->id;

        return [
            'file'                => ['required', 'file', 'mimes:csv,txt', 'max:10240'],
            'wallet_id'           => ['required', 'uuid', Rule::exists('wallets', 'id')->where('user_id', $userId)],
            'mapping'             => ['required', 'array'],
            'mapping.date'        => ['required', 'string'],
            'mapping.label'       => ['required', 'string'],
            'mapping.amount'      => ['required', 'string'],
            'mapping.type'        => ['nullable', 'string'],
            'mapping.notes'       => ['nullable', 'string'],
            'default_type'        => ['nullable', Rule::enum(TransactionType::class)],
            'date_format'         => ['nullable', 'string', 'max:20'],
        ];
    }
}
