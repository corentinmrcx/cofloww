<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdatePasswordRequest;
use App\Http\Requests\UpdatePreferencesRequest;
use App\Http\Requests\UpdateProfileRequest;
use App\Http\Requests\UploadAvatarRequest;
use App\Http\Resources\UserResource;
use App\Services\ProfileService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ProfileController extends Controller
{
    public function __construct(private ProfileService $profileService) {}

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

    public function uploadAvatar(UploadAvatarRequest $request): JsonResponse
    {
        $user = $request->user();

        if ($user->avatar) {
            if (Storage::disk('local')->exists($user->avatar)) {
                Storage::disk('local')->delete($user->avatar);
            } elseif (Storage::disk('public')->exists($user->avatar)) {
                Storage::disk('public')->delete($user->avatar);
            }
        }

        $path = $request->file('avatar')->store('avatars', 'local');
        $user->update(['avatar' => $path]);

        $avatarUrl = url('/api/v1/profile/avatar') . '?v=' . substr(md5($path), 0, 8);

        return response()->json(['data' => ['avatar_url' => $avatarUrl]]);
    }

    public function serveAvatar(Request $request): mixed
    {
        $user = $request->user();

        if (! $user->avatar) {
            abort(404);
        }

        if (Storage::disk('local')->exists($user->avatar)) {
            return Storage::disk('local')->response($user->avatar);
        }

        if (Storage::disk('public')->exists($user->avatar)) {
            return Storage::disk('public')->response($user->avatar);
        }

        abort(404);
    }

    public function updatePreferences(UpdatePreferencesRequest $request): JsonResponse
    {
        $this->profileService->updatePreferences($request->user(), $request->validated());

        return response()->json(['data' => new UserResource($request->user()->fresh())]);
    }
}
