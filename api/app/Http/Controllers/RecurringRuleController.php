<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreRecurringRuleRequest;
use App\Http\Requests\UpdateRecurringRuleRequest;
use App\Http\Resources\RecurringRuleResource;
use App\Models\RecurringRule;
use App\Services\RecurringRuleService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\ResourceCollection;
use Illuminate\Http\Response;

class RecurringRuleController extends Controller
{
    public function __construct(private RecurringRuleService $service) {}

    public function index(): ResourceCollection
    {
        return RecurringRuleResource::collection(
            $this->service->index(request()->user()->id)
        );
    }

    public function store(StoreRecurringRuleRequest $request): JsonResponse
    {
        $rule = $this->service->store($request->validated(), $request->user()->id);

        return (new RecurringRuleResource($rule))->response()->setStatusCode(201);
    }

    public function update(UpdateRecurringRuleRequest $request, RecurringRule $recurringRule): RecurringRuleResource
    {
        return new RecurringRuleResource(
            $this->service->update($recurringRule, $request->validated())
        );
    }

    public function destroy(RecurringRule $recurringRule): Response
    {
        $this->service->destroy($recurringRule);

        return response()->noContent();
    }
}
