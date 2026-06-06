<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreGoalRequest;
use App\Http\Requests\UpdateGoalRequest;
use App\Http\Resources\GoalResource;
use App\Models\Goal;
use App\Services\GoalService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\ResourceCollection;
use Illuminate\Http\Response;

class GoalController extends Controller
{
    public function __construct(private GoalService $service) {}

    public function index(Request $request): ResourceCollection
    {
        $goals = $this->service->index($request->user()->id);

        return GoalResource::collection($goals);
    }

    public function store(StoreGoalRequest $request): JsonResponse
    {
        $goal = $this->service->store($request->validated(), $request->user()->id);

        return (new GoalResource($goal))->response()->setStatusCode(201);
    }

    public function update(UpdateGoalRequest $request, Goal $goal): GoalResource
    {
        return new GoalResource($this->service->update($goal, $request->validated()));
    }

    public function destroy(Goal $goal): Response
    {
        $this->service->destroy($goal);

        return response()->noContent();
    }
}
