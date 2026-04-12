<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'         => $this->id,
            'firstname'  => $this->firstname,
            'lastname'   => $this->lastname,
            'email'      => $this->email,
            'currency'   => $this->currency,
            'timezone'   => $this->timezone,
            'avatar_url' => $this->avatar
                ? url('/api/v1/profile/avatar') . '?v=' . substr(md5($this->avatar), 0, 8)
                : null,
            'settings'   => $this->settings ?? (object)[],
            'created_at' => $this->created_at,
        ];
    }
}
