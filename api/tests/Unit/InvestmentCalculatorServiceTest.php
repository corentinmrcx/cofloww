<?php

namespace Tests\Unit;

use App\Models\InvestmentPocket;
use App\Services\InvestmentCalculatorService;
use Illuminate\Support\Collection;
use Tests\TestCase;

class InvestmentCalculatorServiceTest extends TestCase
{
    private InvestmentCalculatorService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new InvestmentCalculatorService();
    }

    private function pocket(string $name, float $pct): InvestmentPocket
    {
        $p = new InvestmentPocket();
        $p->name       = $name;
        $p->target_pct = $pct;
        $p->color      = '#000';
        return $p;
    }

    // ——————————————————————————————————————————————
    // investable
    // ——————————————————————————————————————————————

    public function test_investable_is_salary_minus_seuil_minus_depenses(): void
    {
        $pockets = collect([$this->pocket('PEA', 100)]);

        $result = $this->service->compute(
            pockets:    $pockets,
            depenses:   100000,  // 1 000 €
            soldeAvant: 0,
            salaire:    280000,  // 2 800 €
            seuil:      50000,   // 500 €
            pasArrondi: 100,     // arrondi à 1 €
        );

        // investable = 0 + 280000 - 50000 - 100000 = 130000
        $this->assertSame(130000, $result['investable']);
    }

    public function test_investable_includes_solde_avant(): void
    {
        $pockets = collect([$this->pocket('PEA', 100)]);

        $result = $this->service->compute(
            pockets:    $pockets,
            depenses:   0,
            soldeAvant: 50000,
            salaire:    280000,
            seuil:      0,
            pasArrondi: 100,
        );

        $this->assertSame(330000, $result['investable']);
    }

    public function test_investable_is_zero_when_depenses_exceed_disponible(): void
    {
        $pockets = collect([$this->pocket('PEA', 100)]);

        $result = $this->service->compute(
            pockets:    $pockets,
            depenses:   300000,
            soldeAvant: 0,
            salaire:    280000,
            seuil:      50000,
            pasArrondi: 100,
        );

        $this->assertSame(0, $result['investable']);
        $this->assertSame(0, $result['allocations'][0]['amount']);
    }

    // ——————————————————————————————————————————————
    // Distribution — somme % = 100
    // ——————————————————————————————————————————————

    public function test_sum_100_pct_distributes_full_investable(): void
    {
        // 55 % PEA + 20 % CTO + 25 % Livret = 100 %
        $pockets = collect([
            $this->pocket('PEA',     55),
            $this->pocket('CTO',     20),
            $this->pocket('Livret',  25),
        ]);

        // investable = 280000 - 50000 - 100000 = 130000
        $result = $this->service->compute(
            pockets:    $pockets,
            depenses:   100000,
            soldeAvant: 0,
            salaire:    280000,
            seuil:      50000,
            pasArrondi: 100,
        );

        $this->assertSame(71500, $result['allocations'][0]['amount']); // 130000 * 55% = 71500
        $this->assertSame(26000, $result['allocations'][1]['amount']); // 130000 * 20% = 26000
        $this->assertSame(32500, $result['allocations'][2]['amount']); // 130000 * 25% = 32500
        $this->assertSame(130000, $result['total_alloue']);
        $this->assertSame(0, $result['reste']);
    }

    // ——————————————————————————————————————————————
    // Distribution — somme % < 100 (normalisation)
    // ——————————————————————————————————————————————

    public function test_sum_less_than_100_pct_normalizes_correctly(): void
    {
        // 60 % + 40 % = 100 % → simple, total = 100 %
        // Testons 60 % seul → normalisé à 100 %
        $pockets = collect([
            $this->pocket('PEA', 60),
            $this->pocket('CTO', 40),
        ]);

        $result = $this->service->compute(
            pockets:    $pockets,
            depenses:   0,
            soldeAvant: 0,
            salaire:    100000, // 1 000 €
            seuil:      0,
            pasArrondi: 100,
        );

        // total_pct = 100, pea = 60000, cto = 40000
        $this->assertSame(60000, $result['allocations'][0]['amount']);
        $this->assertSame(40000, $result['allocations'][1]['amount']);
    }

    public function test_partial_pct_normalizes_so_full_investable_is_distributed(): void
    {
        // 55 % PEA + 20 % CTO = 75 % total
        // Après normalisation : PEA = 55/75 ≈ 73.33 %, CTO = 20/75 ≈ 26.67 %
        $pockets = collect([
            $this->pocket('PEA', 55),
            $this->pocket('CTO', 20),
        ]);

        $result = $this->service->compute(
            pockets:    $pockets,
            depenses:   0,
            soldeAvant: 0,
            salaire:    75000, // 750 €, chiffre rond pour faciliter
            seuil:      0,
            pasArrondi: 100,
        );

        // PEA: floor(75000 * 55/75 / 100) * 100 — float(55/75)=0.7333… → 54999.9… → floor=549 → 54900
        // CTO: floor(75000 * 20/75 / 100) * 100 = floor(20000/100)*100 = 20000
        $this->assertSame(54900, $result['allocations'][0]['amount']);
        $this->assertSame(20000, $result['allocations'][1]['amount']);
        $this->assertSame(74900, $result['total_alloue']);
    }

    // ——————————————————————————————————————————————
    // Pas d'arrondi
    // ——————————————————————————————————————————————

    public function test_pas_arrondi_500_rounds_down_to_nearest_5_euros(): void
    {
        // 1 poche à 100 %, investable = 12345 centimes (123,45 €)
        // Floor(12345 / 500) * 500 = 24 * 500 = 12000
        $pockets = collect([$this->pocket('PEA', 100)]);

        $result = $this->service->compute(
            pockets:    $pockets,
            depenses:   0,
            soldeAvant: 0,
            salaire:    12345,
            seuil:      0,
            pasArrondi: 500,
        );

        $this->assertSame(12000, $result['allocations'][0]['amount']);
        $this->assertSame(345,   $result['reste']);
    }

    public function test_pas_arrondi_1000_rounds_down_to_nearest_10_euros(): void
    {
        // investable = 12345 centimes
        // Floor(12345 / 1000) * 1000 = 12 * 1000 = 12000
        $pockets = collect([$this->pocket('PEA', 100)]);

        $result = $this->service->compute(
            pockets:    $pockets,
            depenses:   0,
            soldeAvant: 0,
            salaire:    12345,
            seuil:      0,
            pasArrondi: 1000,
        );

        $this->assertSame(12000, $result['allocations'][0]['amount']);
        $this->assertSame(345,   $result['reste']);
    }

    public function test_rounding_remainder_accumulates_correctly(): void
    {
        // 3 poches à 33.33 % ≈ ~99.99 %, investable = 10000
        $pockets = collect([
            $this->pocket('A', 33.33),
            $this->pocket('B', 33.33),
            $this->pocket('C', 33.34),
        ]);

        $result = $this->service->compute(
            pockets:    $pockets,
            depenses:   0,
            soldeAvant: 0,
            salaire:    10000,
            seuil:      0,
            pasArrondi: 1000,
        );

        // total_alloue + reste doit toujours = investable
        $this->assertSame($result['investable'], $result['total_alloue'] + $result['reste']);
    }

    // ——————————————————————————————————————————————
    // Cas limites
    // ——————————————————————————————————————————————

    public function test_empty_pockets_returns_zero_allocations(): void
    {
        $result = $this->service->compute(
            pockets:    collect(),
            depenses:   0,
            soldeAvant: 0,
            salaire:    280000,
            seuil:      0,
            pasArrondi: 100,
        );

        $this->assertSame(0, $result['total_alloue']);
        $this->assertSame(280000, $result['reste']);
        $this->assertEmpty($result['allocations']);
    }

    public function test_investable_zero_all_amounts_are_zero(): void
    {
        $pockets = collect([
            $this->pocket('PEA', 55),
            $this->pocket('CTO', 45),
        ]);

        $result = $this->service->compute(
            pockets:    $pockets,
            depenses:   300000,
            soldeAvant: 0,
            salaire:    280000,
            seuil:      50000,
            pasArrondi: 1000,
        );

        $this->assertSame(0, $result['investable']);
        foreach ($result['allocations'] as $a) {
            $this->assertSame(0, $a['amount']);
        }
        $this->assertSame(0, $result['total_alloue']);
        $this->assertSame(0, $result['reste']);
    }
}
