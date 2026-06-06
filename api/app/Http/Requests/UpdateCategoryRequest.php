<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCategoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'name'       => ['sometimes', 'string', 'max:100'],
            'color'      => ['nullable', 'string', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'icon'       => ['nullable', 'string', 'max:50'],
            'parent_id'  => ['nullable', 'uuid', Rule::exists('categories', 'id')->where('user_id', $this->user()->id)],
            'sort_order' => ['integer', 'min:0'],
        ];
    }
}
