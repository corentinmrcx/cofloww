<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePreferencesRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'language'    => ['sometimes', 'string', 'in:fr,en'],
            'date_format' => ['sometimes', 'string', 'in:DD/MM/YYYY,MM/DD/YYYY,YYYY-MM-DD'],
            'theme'       => ['sometimes', 'string', 'in:light,dark,system'],
            'currency'    => ['sometimes', 'string', 'max:10'],
            'timezone'    => ['sometimes', 'string', 'max:60'],
        ];
    }
}
