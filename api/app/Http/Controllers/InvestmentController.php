<?php

namespace App\Http\Controllers;

use App\Http\Requests\ComputeInvestmentRequest;
use App\Http\Resources\WalletResource;
use App\Models\Budget;
use App\Models\Wallet;
use App\Services\InvestmentCalculatorService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Carbon;

class InvestmentController extends Controller
{
    public function __construct(private InvestmentCalculatorService $calculator) {}

    public function compute(ComputeInvestmentRequest $request): JsonResponse
    {
        $user = $request->user();
        $data = $request->validated();

        // Solde = balance du compte sélectionné, vérifié appartenance à l'utilisateur
        $sourceWallet = Wallet::where('user_id', $user->id)->findOrFail($data['wallet_id']);
        $solde        = $sourceWallet->balance;

        // Mois cible : fourni par le front ou mois prochain par défaut
        $targetMonth = isset($data['month'], $data['year'])
            ? Carbon::createFromDate($data['year'], $data['month'], 1)
            : Carbon::now()->addMonth();

        $depenses    = (int) Budget::withoutGlobalScopes()
            ->where('user_id', $user->id)
            ->where('period', 'monthly')
            ->where('month', $targetMonth->month)
            ->where('year', $targetMonth->year)
            ->sum('amount');

        // Wallets avec un % d'investissement défini (les comptes cibles)
        $wallets = Wallet::withoutGlobalScopes()
            ->where('user_id', $user->id)
            ->where('is_archived', false)
            ->whereNotNull('investment_target_pct')
            ->where('investment_target_pct', '>', 0)
            ->orderBy('sort_order')
            ->get();

        $pockets = $wallets->map(fn ($w) => (object) [
            'target_pct' => (float) $w->investment_target_pct,
            'wallet'     => $w,
        ]);

        $result = $this->calculator->compute(
            pockets:    $pockets,
            depenses:   $depenses,
            soldeAvant: (int) $solde,
            salaire:    0,
            seuil:      (int) $data['seuil'],
            pasArrondi: (int) $data['pas_arrondi'],
        );

        $result['allocations'] = $result['allocations']->map(fn ($a) => [
            'wallet' => new WalletResource($a['pocket']->wallet),
            'amount' => $a['amount'],
        ]);

        $result['source_wallet']  = new WalletResource($sourceWallet);
        $result['target_month']   = $targetMonth->format('Y-m');

        // Nettoyer les clés inutiles pour ce contexte
        unset($result['disponible']);

        return response()->json(['data' => $result]);
    }
}
