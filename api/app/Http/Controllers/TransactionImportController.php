<?php

namespace App\Http\Controllers;

use App\Http\Requests\ConfirmImportRequest;
use App\Http\Requests\PreviewImportRequest;
use App\Services\NotificationService;
use App\Services\TransactionImportService;
use Illuminate\Http\JsonResponse;

class TransactionImportController extends Controller
{
    public function __construct(
        private TransactionImportService $service,
        private NotificationService $notifications,
    ) {}

    public function preview(PreviewImportRequest $request): JsonResponse
    {
        $result = $this->service->preview($request->file('file'));

        return response()->json($result);
    }

    public function confirm(ConfirmImportRequest $request): JsonResponse
    {
        $result = $this->service->import(
            file:          $request->file('file'),
            mapping:       $request->validated('mapping'),
            walletId:      $request->validated('wallet_id'),
            userId:        $request->user()->id,
            defaultType:   $request->validated('default_type') ?? 'expense',
            dateFormat:    $request->validated('date_format') ?? 'Y-m-d',
        );

        $count = $result['imported'] ?? 0;
        $this->notifications->importSuccess($request->user()->id, $count);

        return response()->json($result);
    }
}
