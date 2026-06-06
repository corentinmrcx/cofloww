<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use App\Http\Requests\Auth\SendPasswordResetRequest;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Password;
use Illuminate\Validation\ValidationException;

class PasswordResetLinkController extends Controller
{
    public function store(SendPasswordResetRequest $request): JsonResponse
    {
        App::setLocale($request->input('lang', 'fr'));

        try {
            $status = Password::sendResetLink($request->only('email'));
        } catch (\Throwable $e) {
            Log::error('Password reset mail failed', ['error' => $e->getMessage()]);

            // On retourne un succès pour ne pas révéler l'erreur interne
            return response()->json(['status' => 'passwords.sent']);
        }

        if ($status !== Password::RESET_LINK_SENT) {
            throw ValidationException::withMessages([
                'email' => [__($status)],
            ]);
        }

        return response()->json(['status' => __($status)]);
    }
}
