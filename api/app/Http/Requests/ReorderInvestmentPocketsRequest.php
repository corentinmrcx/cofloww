<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ReorderInvestmentPocketsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'pockets'              => ['required', 'array'],
            'pockets.*.id'         => ['required', 'uuid', Rule::exists('investment_pockets', 'id')->where('user_id', $this->user()->id)],
            'pockets.*.sort_order' => ['required', 'integer', 'min:0'],
        ];
    }
}
