<?php

use App\Http\Controllers\AccountController;
use App\Http\Controllers\AppNotificationController;
use App\Http\Controllers\BudgetController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\InvestmentController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\StatsController;
use App\Http\Controllers\RecurringRuleController;
use App\Http\Controllers\TagController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\TransactionImportController;
use App\Http\Controllers\WalletController;
use App\Http\Resources\UserResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth:sanctum'])->get('/user', function (Request $request) {
    return new UserResource($request->user());
});

Route::middleware(['auth:sanctum'])->prefix('v1')->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index']);

    // Profil & compte
    Route::patch('profile',              [ProfileController::class, 'update']);
    Route::patch('profile/password',     [ProfileController::class, 'updatePassword']);
    Route::post('profile/avatar',        [ProfileController::class, 'uploadAvatar']);
    Route::patch('profile/preferences',  [ProfileController::class, 'updatePreferences']);
    Route::get('account/export',         [AccountController::class, 'export']);
    Route::delete('account',             [AccountController::class, 'destroy']);
    Route::post('account/logout-all',    [AccountController::class, 'logoutAll']);

    // Notifications
    Route::get('notifications',                          [AppNotificationController::class, 'index']);
    Route::patch('notifications/{notification}/read',    [AppNotificationController::class, 'markRead']);
    Route::post('notifications/read-all',                [AppNotificationController::class, 'markAllRead']);

    Route::post('wallets/reorder', [WalletController::class, 'reorder']);
    Route::apiResource('wallets', WalletController::class);

    Route::apiResource('categories', CategoryController::class)->except('show');
    Route::apiResource('tags', TagController::class)->only('index', 'store', 'destroy');

    Route::apiResource('recurring-rules', RecurringRuleController::class)->except('show');
    Route::apiResource('budgets', BudgetController::class)->except('show');

    Route::get('investments/compute', [InvestmentController::class, 'compute']);

    Route::prefix('stats')->group(function () {
        Route::get('income-vs-expenses',   [StatsController::class, 'incomeVsExpenses']);
        Route::get('expenses-by-category', [StatsController::class, 'expensesByCategory']);
        Route::get('overview',             [StatsController::class, 'overview']);
    });

    Route::get('transactions/export', [TransactionController::class, 'export']);
    Route::post('transactions/import', [TransactionImportController::class, 'preview']);
    Route::post('transactions/import/confirm', [TransactionImportController::class, 'confirm']);
    Route::post('transactions/bulk-delete', [TransactionController::class, 'bulkDestroy']);
    Route::apiResource('transactions', TransactionController::class);
});
