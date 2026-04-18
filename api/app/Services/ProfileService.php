<?php

namespace App\Services;

use App\Models\User;

class ProfileService
{
    private const DIRECT_COLUMNS = ['currency', 'timezone'];

    public function updatePreferences(User $user, array $data): void
    {
        $direct = array_filter(array_intersect_key($data, array_flip(self::DIRECT_COLUMNS)));
        if (! empty($direct)) {
            $user->update($direct);
        }

        $settingsKeys = array_diff_key($data, array_flip(self::DIRECT_COLUMNS));
        if (! empty($settingsKeys)) {
            $user->update(['settings' => array_merge($user->settings ?? [], $settingsKeys)]);
        }
    }
}
