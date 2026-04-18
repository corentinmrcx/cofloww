<?php

namespace App\Http\Controllers;

use App\Http\Requests\DestroyAccountRequest;
use App\Services\AccountService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class AccountController extends Controller
{
    public function __construct(private AccountService $accountService) {}

    public function export(Request $request): JsonResponse
    {
        $data = $this->accountService->export($request->user());

        return response()->json($data)->header('Content-Disposition', 'attachment; filename="cofloww-export.json"');
    }

    public function destroy(DestroyAccountRequest $request): JsonResponse
    {
        $user = $request->user();

        DB::transaction(function () use ($user) {
            if ($user->avatar) {
                Storage::disk('public')->delete($user->avatar);
            }
            $user->tokens()->delete();
            $user->delete();
        });

        return response()->json(['message' => 'Compte supprimé.']);
    }

    public function logoutAll(Request $request): JsonResponse
    {
        $request->user()->tokens()->delete();

        return response()->json(['message' => 'Tous les appareils ont été déconnectés.']);
    }
}
