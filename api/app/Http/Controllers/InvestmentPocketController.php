<?php

namespace App\Http\Controllers;

use App\Http\Requests\ComputeInvestmentRequest;
use App\Http\Requests\ReorderInvestmentPocketsRequest;
use App\Http\Requests\StoreInvestmentPocketRequest;
use App\Http\Requests\UpdateInvestmentPocketRequest;
use App\Http\Resources\InvestmentPocketResource;
use App\Models\Budget;
use App\Models\InvestmentPocket;
use App\Services\InvestmentCalculatorService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\ResourceCollection;
use Illuminate\Http\Response;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class InvestmentPocketController extends Controller
{
    public function __construct(private InvestmentCalculatorService $calculator) {}

    public function index(): ResourceCollection
    {
        return InvestmentPocketResource::collection(
            InvestmentPocket::with('wallet')->orderBy('sort_order')->get()
        );
    }

    public function store(StoreInvestmentPocketRequest $request): JsonResponse
    {
        $pocket = InvestmentPocket::create([
            ...$request->validated(),
            'user_id' => $request->user()->id,
        ]);

        return (new InvestmentPocketResource($pocket->load('wallet')))
            ->response()
            ->setStatusCode(201);
    }

    public function update(UpdateInvestmentPocketRequest $request, InvestmentPocket $investmentPocket): InvestmentPocketResource
    {
        $investmentPocket->update($request->validated());

        return new InvestmentPocketResource($investmentPocket->fresh('wallet'));
    }

    public function destroy(InvestmentPocket $investmentPocket): Response
    {
        $investmentPocket->delete();

        return response()->noContent();
    }

    public function reorder(ReorderInvestmentPocketsRequest $request): Response
    {
        DB::transaction(function () use ($request) {
            foreach ($request->validated('pockets') as $item) {
                InvestmentPocket::where('id', $item['id'])->update(['sort_order' => $item['sort_order']]);
            }
        });

        return response()->noContent();
    }

    public function compute(ComputeInvestmentRequest $request): JsonResponse
    {
        $data = $request->validated();

        $targetMonth = Carbon::now()->addMonth();
        $month       = $data['month'] ?? $targetMonth->month;
        $year        = $data['year']  ?? $targetMonth->year;

        // Dépenses prévues = somme des budgets mensuels du mois cible
        $depenses = (int) Budget::withoutGlobalScopes()
            ->where('user_id', $request->user()->id)
            ->where('period', 'monthly')
            ->where('month', $month)
            ->where('year', $year)
            ->sum('amount');

        $pockets = InvestmentPocket::with('wallet')->orderBy('sort_order')->get();

        $result = $this->calculator->compute(
            pockets:    $pockets,
            depenses:   $depenses,
            soldeAvant: $data['solde_avant'],
            salaire:    $data['salaire'],
            seuil:      $data['seuil'],
            pasArrondi: $data['pas_arrondi'],
        );

        // Sérialiser les pockets dans les allocations
        $result['allocations'] = $result['allocations']->map(fn ($a) => [
            'pocket' => new InvestmentPocketResource($a['pocket']),
            'amount' => $a['amount'],
        ]);

        return response()->json(['data' => $result]);
    }
}
