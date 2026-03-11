<?php

namespace App\Http\Controllers;

use App\Http\Requests\ReorderWalletsRequest;
use App\Http\Requests\StoreWalletRequest;
use App\Http\Requests\UpdateWalletRequest;
use App\Http\Resources\WalletResource;
use App\Models\Wallet;
use App\Services\WalletService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\ResourceCollection;
use Illuminate\Http\Response;

class WalletController extends Controller
{
    public function __construct(private WalletService $service) {}

    public function index(): ResourceCollection
    {
        return WalletResource::collection(Wallet::orderBy('sort_order')->get());
    }

    public function show(Wallet $wallet): WalletResource
    {
        return new WalletResource($wallet);
    }

    public function store(StoreWalletRequest $request): JsonResponse
    {
        $wallet = $this->service->store($request->validated(), $request->user()->id);

        return (new WalletResource($wallet))->response()->setStatusCode(201);
    }

    public function update(UpdateWalletRequest $request, Wallet $wallet): WalletResource
    {
        return new WalletResource($this->service->update($wallet, $request->validated()));
    }

    public function destroy(Wallet $wallet): Response
    {
        $this->service->archive($wallet);

        return response()->noContent();
    }

    public function reorder(ReorderWalletsRequest $request): Response
    {
        $this->service->reorder($request->user()->id, $request->validated('wallets'));

        return response()->noContent();
    }
}
