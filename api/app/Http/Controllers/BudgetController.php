<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreBudgetRequest;
use App\Http\Requests\UpdateBudgetRequest;
use App\Http\Resources\BudgetResource;
use App\Models\Budget;
use App\Services\BudgetService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\ResourceCollection;
use Illuminate\Http\Response;

class BudgetController extends Controller
{
    public function __construct(private BudgetService $service) {}

    public function index(): ResourceCollection
    {
        $month = request()->integer('month') ?: null;
        $year  = request()->integer('year')  ?: null;

        return BudgetResource::collection(
            $this->service->index(request()->user()->id, $month, $year)
        );
    }

    public function store(StoreBudgetRequest $request): JsonResponse
    {
        $budget = $this->service->store($request->validated(), $request->user()->id);

        return (new BudgetResource($budget))->response()->setStatusCode(201);
    }

    public function update(UpdateBudgetRequest $request, Budget $budget): BudgetResource
    {
        return new BudgetResource(
            $this->service->update($budget, $request->validated())
        );
    }

    public function destroy(Budget $budget): Response
    {
        $this->service->destroy($budget);

        return response()->noContent();
    }
}
