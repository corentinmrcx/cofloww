<?php

namespace App\Http\Controllers;

use App\Http\Requests\ExpensesByCategoryRequest;
use App\Http\Requests\IncomeVsExpensesRequest;
use App\Services\StatsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StatsController extends Controller
{
    public function __construct(private StatsService $stats) {}

    public function incomeVsExpenses(IncomeVsExpensesRequest $request): JsonResponse
    {
        $data = $this->stats->incomeVsExpenses(
            userId: $request->user()->id,
            months: $request->months(),
        );

        return response()->json(['data' => $data]);
    }

    public function expensesByCategory(ExpensesByCategoryRequest $request): JsonResponse
    {
        $data = $this->stats->expensesByCategory(
            userId: $request->user()->id,
            from:   $request->from(),
            to:     $request->to(),
        );

        return response()->json(['data' => $data]);
    }

    public function overview(Request $request): JsonResponse
    {
        $data = $this->stats->overview($request->user()->id);

        return response()->json(['data' => $data]);
    }
}
