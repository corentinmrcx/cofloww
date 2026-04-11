<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdatePasswordRequest;
use App\Http\Requests\UpdatePreferencesRequest;
use App\Http\Requests\UpdateProfileRequest;
use App\Http\Resources\UserResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ProfileController extends Controller
{
    public function update(UpdateProfileRequest $request): JsonResponse
    {
        $request->user()->update($request->validated());

        return response()->json(['data' => new UserResource($request->user()->fresh())]);
    }

    public function updatePassword(UpdatePasswordRequest $request): JsonResponse
    {
        $request->user()->update(['password' => $request->validated('password')]);

        return response()->json(['message' => 'Mot de passe mis à jour.']);
    }

    public function uploadAvatar(Request $request): JsonResponse
    {
        $request->validate([
            'avatar' => ['required', 'image', 'max:2048', 'mimes:jpg,jpeg,png,webp'],
        ]);

        $user = $request->user();

        // Supprime l'ancien avatar
        if ($user->avatar) {
            Storage::disk('public')->delete($user->avatar);
        }

        $path = $request->file('avatar')->store('avatars', 'public');
        $user->update(['avatar' => $path]);

        return response()->json([
            'data' => ['avatar_url' => Storage::disk('public')->url($path)],
        ]);
    }

    public function updatePreferences(UpdatePreferencesRequest $request): JsonResponse
    {
        $user = $request->user();
        $data = $request->validated();

        // currency + timezone restent des colonnes directes
        $direct = array_filter(array_intersect_key($data, array_flip(['currency', 'timezone'])));
        if (!empty($direct)) {
            $user->update($direct);
        }

        // Les autres clés vont dans settings jsonb
        $settingsKeys = array_diff_key($data, array_flip(['currency', 'timezone']));
        if (!empty($settingsKeys)) {
            $current  = $user->settings ?? [];
            $user->update(['settings' => array_merge($current, $settingsKeys)]);
        }

        return response()->json(['data' => new UserResource($user->fresh())]);
    }
}
