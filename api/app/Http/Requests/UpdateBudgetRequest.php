<?php

namespace App\Http\Requests;

use App\Enums\BudgetPeriod;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateBudgetRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        $userId = $this->user()->id;

        return [
            'category_ids'        => ['sometimes', 'array', 'min:1'],
            'category_ids.*'      => [
                'uuid',
                Rule::exists('categories', 'id')->where(
                    fn ($q) => $q->where('user_id', $userId)->orWhereNull('user_id')
                ),
            ],
            'amount'              => ['sometimes', 'integer', 'min:1'],
            'period'              => ['sometimes', Rule::enum(BudgetPeriod::class)],
            'month'               => ['sometimes', 'nullable', 'integer', 'min:1', 'max:12'],
            'year'                => ['sometimes', 'integer', 'min:2000', 'max:2100'],
            'alert_threshold_pct' => ['sometimes', 'integer', 'min:0', 'max:100'],
            'is_active'           => ['sometimes', 'boolean'],
        ];
    }
}
