<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProfileRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'firstname' => ['required', 'string', 'max:100'],
            'lastname'  => ['required', 'string', 'max:100'],
            'email'     => ['required', 'email', Rule::unique('users', 'email')->ignore($this->user()->id)],
            'currency'  => ['sometimes', 'string', 'max:10'],
            'timezone'  => ['sometimes', 'string', 'max:60'],
        ];
    }
}
