<?php

namespace App\Services;

use Illuminate\Support\Collection;

class InvestmentCalculatorService
{
    /**
     * Calcule la répartition d'investissement par poche.
     *
     * Tous les montants sont en centimes.
     *
     * @param  Collection  $pockets    Collection d'InvestmentPocket (target_pct, name, …)
     * @param  int         $depenses   Somme des budgets prévus pour le mois cible (centimes)
     * @param  int         $soldeAvant Solde du compte avant réception du salaire (centimes)
     * @param  int         $salaire    Salaire entrant (centimes)
     * @param  int         $seuil      Montant minimum à conserver sur le compte (centimes)
     * @param  int         $pasArrondi Pas d'arrondi en centimes (ex: 1000 = arrondi à 10 €)
     */
    public function compute(
        Collection $pockets,
        int $depenses,
        int $soldeAvant,
        int $salaire,
        int $seuil,
        int $pasArrondi,
    ): array {
        $disponible = $soldeAvant + $salaire;
        $investable = max(0, $disponible - $seuil - $depenses);

        $totalPct = (float) $pockets->sum('target_pct');

        if ($totalPct <= 0 || $investable === 0 || $pockets->isEmpty()) {
            $allocations = $pockets->map(fn ($p) => [
                'pocket' => $p,
                'amount' => 0,
            ])->values();

            return [
                'disponible'   => $disponible,
                'depenses'     => $depenses,
                'seuil'        => $seuil,
                'investable'   => $investable,
                'allocations'  => $allocations,
                'total_alloue' => 0,
                'reste'        => $investable,
            ];
        }

        $step = max(1, $pasArrondi);

        $allocations = $pockets->map(function ($pocket) use ($investable, $totalPct, $step) {
            $pctNorm = $pocket->target_pct / $totalPct;
            $raw     = $investable * $pctNorm;
            $amount  = (int) (floor($raw / $step) * $step);

            return [
                'pocket' => $pocket,
                'amount' => $amount,
            ];
        })->values();

        $totalAlloue = $allocations->sum('amount');
        $reste       = $investable - $totalAlloue;

        return [
            'disponible'   => $disponible,
            'depenses'     => $depenses,
            'seuil'        => $seuil,
            'investable'   => $investable,
            'allocations'  => $allocations,
            'total_alloue' => $totalAlloue,
            'reste'        => $reste,
        ];
    }
}
