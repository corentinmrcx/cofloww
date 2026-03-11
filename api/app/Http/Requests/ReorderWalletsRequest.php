<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ReorderWalletsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'wallets'              => ['required', 'array'],
            'wallets.*.id'         => ['required', 'uuid', Rule::exists('wallets', 'id')->where('user_id', $this->user()->id)],
            'wallets.*.sort_order' => ['required', 'integer', 'min:0'],
        ];
    }
}
