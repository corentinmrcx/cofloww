<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class IncomeVsExpensesRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'period' => ['sometimes', 'string', 'in:3m,6m,12m,24m'],
        ];
    }

    public function months(): int
    {
        return match ($this->input('period', '12m')) {
            '3m'  => 3,
            '6m'  => 6,
            '24m' => 24,
            default => 12,
        };
    }
}
