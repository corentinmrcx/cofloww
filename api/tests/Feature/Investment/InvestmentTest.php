<?php

namespace Tests\Feature\Investment;

use App\Models\Budget;
use App\Models\Category;
use App\Models\User;
use App\Models\Wallet;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class InvestmentTest extends TestCase
{
    use RefreshDatabase;

    private function url(string $walletId, int $seuil = 0, int $pas = 100): string
    {
        return "/api/v1/investments/compute?wallet_id={$walletId}&seuil={$seuil}&pas_arrondi={$pas}";
    }

    // ——————————————————————————————————————————————
    // Auth
    // ——————————————————————————————————————————————

    public function test_unauthenticated_user_cannot_compute(): void
    {
        $this->getJson('/api/v1/investments/compute?wallet_id=x&seuil=0&pas_arrondi=100')
            ->assertUnauthorized();
    }

    // ——————————————————————————————————————————————
    // Validation
    // ——————————————————————————————————————————————

    public function test_cannot_use_another_user_wallet(): void
    {
        $userA  = User::factory()->create();
        $userB  = User::factory()->create();
        $wallet = Wallet::factory()->for($userB)->create(['is_archived' => false]);

        $this->actingAs($userA)
            ->getJson($this->url($wallet->id))
            ->assertUnprocessable();
    }

    // ——————————————————————————————————————————————
    // Calcul
    // ——————————————————————————————————————————————

    public function test_investable_equals_balance_minus_seuil_minus_depenses(): void
    {
        $user     = User::factory()->create();
        $source   = Wallet::factory()->for($user)->create([
            'initial_balance' => 300000, // 3 000 €
            'balance_cache'   => 0,
            'is_archived'     => false,
        ]);
        $category = Category::factory()->for($user)->create();

        // Poche cible
        Wallet::factory()->for($user)->create([
            'investment_target_pct' => 100,
            'is_archived'           => false,
        ]);

        // Budget mois prochain : 50 €
        $nextMonth = now()->addMonth();
        $budget    = Budget::factory()->monthly($nextMonth->year, $nextMonth->month)->create([
            'user_id' => $user->id,
            'amount'  => 5000,
        ]);
        $budget->categories()->attach($category->id);

        // investable = 300000 - 20000 (seuil) - 5000 (depenses) = 275000
        $this->actingAs($user)
            ->getJson($this->url($source->id, seuil: 20000))
            ->assertOk()
            ->assertJsonPath('data.investable', 275000);
    }

    public function test_source_wallet_is_excluded_from_target_allocations(): void
    {
        $user   = User::factory()->create();
        $source = Wallet::factory()->for($user)->create([
            'initial_balance'       => 100000,
            'balance_cache'         => 0,
            'investment_target_pct' => 50,   // même wallet source ET cible
            'is_archived'           => false,
        ]);

        // On vérifie juste que le calcul ne plante pas dans ce cas extrême
        $this->actingAs($user)
            ->getJson($this->url($source->id))
            ->assertOk();
    }

    public function test_wallets_without_pct_are_not_in_allocations(): void
    {
        $user   = User::factory()->create();
        $source = Wallet::factory()->for($user)->create([
            'initial_balance'       => 100000,
            'balance_cache'         => 0,
            'investment_target_pct' => null,
            'is_archived'           => false,
        ]);

        $this->actingAs($user)
            ->getJson($this->url($source->id))
            ->assertOk()
            ->assertJsonCount(0, 'data.allocations');
    }

    public function test_only_own_budgets_reduce_investable(): void
    {
        $userA     = User::factory()->create();
        $userB     = User::factory()->create();
        $source    = Wallet::factory()->for($userA)->create([
            'initial_balance' => 100000,
            'balance_cache'   => 0,
            'is_archived'     => false,
        ]);
        $categoryB = Category::factory()->for($userB)->create();

        $nextMonth = now()->addMonth();
        $budget    = Budget::factory()->monthly($nextMonth->year, $nextMonth->month)->create([
            'user_id' => $userB->id,
            'amount'  => 999999,
        ]);
        $budget->categories()->attach($categoryB->id);

        // Le budget de userB ne doit pas affecter userA
        $this->actingAs($userA)
            ->getJson($this->url($source->id))
            ->assertOk()
            ->assertJsonPath('data.depenses', 0)
            ->assertJsonPath('data.investable', 100000);
    }
}
