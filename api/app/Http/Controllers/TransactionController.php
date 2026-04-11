<?php

namespace App\Http\Controllers;

use App\Http\Requests\BulkDeleteTransactionRequest;
use App\Http\Requests\StoreTransactionRequest;
use App\Http\Requests\UpdateTransactionRequest;
use App\Http\Resources\TransactionResource;
use App\Models\Transaction;
use App\Services\NotificationService;
use App\Services\TransactionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\ResourceCollection;
use Illuminate\Http\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class TransactionController extends Controller
{
    public function __construct(
        private TransactionService $service,
        private NotificationService $notifications,
    ) {}

    public function index(Request $request): ResourceCollection
    {
        $paginator = $this->service->index($request->query());

        return TransactionResource::collection($paginator);
    }

    public function store(StoreTransactionRequest $request): JsonResponse
    {
        $transaction = $this->service->store($request->validated(), $request->user()->id);

        $this->notifications->checkBudgetAlerts($request->user()->id);

        return (new TransactionResource($transaction))->response()->setStatusCode(201);
    }

    public function show(Transaction $transaction): TransactionResource
    {
        return new TransactionResource(
            $transaction->load(['wallet', 'category', 'toWallet', 'tags'])
        );
    }

    public function update(UpdateTransactionRequest $request, Transaction $transaction): TransactionResource
    {
        return new TransactionResource(
            $this->service->update($transaction, $request->validated())
        );
    }

    public function destroy(Transaction $transaction): Response
    {
        $this->service->destroy($transaction);

        return response()->noContent();
    }

    public function bulkDestroy(BulkDeleteTransactionRequest $request): Response
    {
        $this->service->bulkDestroy($request->validated('ids'), $request->user()->id);

        return response()->noContent();
    }

    public function export(Request $request): StreamedResponse
    {
        $query    = $this->service->forExport($request->query());
        $filename = 'transactions_' . now()->format('Y-m-d') . '.csv';

        return response()->streamDownload(function () use ($query) {
            $handle = fopen('php://output', 'w');

            // BOM UTF-8 pour compatibilité Excel
            fputs($handle, "\xEF\xBB\xBF");

            fputcsv($handle, ['Date', 'Libellé', 'Montant (€)', 'Type', 'Statut', 'Catégorie', 'Wallet', 'Notes'], ';');

            $query->cursor()->each(function (Transaction $t) use ($handle) {
                fputcsv($handle, [
                    $t->date->toDateString(),
                    $t->label,
                    number_format(abs($t->amount) / 100, 2, ',', ' '),
                    $t->type->value,
                    $t->status->value,
                    $t->category?->name ?? '',
                    $t->wallet?->name ?? '',
                    $t->notes ?? '',
                ], ';');
            });

            fclose($handle);
        }, $filename, ['Content-Type' => 'text/csv; charset=UTF-8']);
    }
}
