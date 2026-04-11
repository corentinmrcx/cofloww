<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Carbon;

class ExpensesByCategoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'from' => ['sometimes', 'date_format:Y-m-d'],
            'to'   => ['sometimes', 'date_format:Y-m-d', 'after_or_equal:from'],
        ];
    }

    public function from(): Carbon
    {
        return $this->has('from')
            ? Carbon::parse($this->input('from'))->startOfDay()
            : Carbon::now()->startOfMonth();
    }

    public function to(): Carbon
    {
        return $this->has('to')
            ? Carbon::parse($this->input('to'))->endOfDay()
            : Carbon::now()->endOfMonth();
    }
}
