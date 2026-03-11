<?php

use App\Http\Controllers\WalletController;
use App\Http\Resources\UserResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth:sanctum'])->get('/user', function (Request $request) {
    return new UserResource($request->user());
});

Route::middleware(['auth:sanctum'])->prefix('v1')->group(function () {
    Route::post('wallets/reorder', [WalletController::class, 'reorder']);
    Route::apiResource('wallets', WalletController::class);
});
