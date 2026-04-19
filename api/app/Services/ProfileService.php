<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class ProfileService
{
    private const DIRECT_COLUMNS = ['currency', 'timezone'];

    public function updateProfile(User $user, array $data): User
    {
        $user->update($data);

        return $user->fresh();
    }

    public function updatePassword(User $user, string $password): void
    {
        $user->update(['password' => $password]);
    }

    public function uploadAvatar(User $user, UploadedFile $file): string
    {
        $oldAvatar = $user->avatar;

        $newPath = $file->store('avatars', 'local');

        try {
            $user->update(['avatar' => $newPath]);
        } catch (\Throwable $e) {
            Storage::disk('local')->delete($newPath);
            throw $e;
        }

        if ($oldAvatar) {
            if (Storage::disk('local')->exists($oldAvatar)) {
                Storage::disk('local')->delete($oldAvatar);
            } elseif (Storage::disk('public')->exists($oldAvatar)) {
                Storage::disk('public')->delete($oldAvatar);
            }
        }

        return $newPath;
    }

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
