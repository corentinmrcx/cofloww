<?php

namespace Tests\Feature\Budget;

use App\Models\Budget;
use App\Models\Category;
use App\Models\Transaction;
use App\Models\User;
use App\Models\Wallet;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BudgetTest extends TestCase
{
    use RefreshDatabase;

    // ————————————————————————————————————————————
    // Authentification
    // ————————————————————————————————————————————

    public function test_unauthenticated_user_cannot_access_budgets(): void
    {
        $this->getJson('/api/v1/budgets')->assertUnauthorized();
        $this->postJson('/api/v1/budgets')->assertUnauthorized();
    }

    // ————————————————————————————————————————————
    // Index & isolation multi-tenant
    // ————————————————————————————————————————————

    public function test_user_can_list_own_budgets(): void
    {
        $user     = User::factory()->create();
        $category = Category::factory()->for($user)->create();

        Budget::factory()->count(3)->create(['user_id' => $user->id])
            ->each(fn ($b) => $b->categories()->attach($category->id));

        $this->actingAs($user)
            ->getJson('/api/v1/budgets')
            ->assertOk()
            ->assertJsonCount(3, 'data');
    }

    public function test_user_only_sees_own_budgets(): void
    {
        $userA     = User::factory()->create();
        $userB     = User::factory()->create();
        $categoryA = Category::factory()->for($userA)->create();
        $categoryB = Category::factory()->for($userB)->create();

        Budget::factory()->count(2)->create(['user_id' => $userA->id])
            ->each(fn ($b) => $b->categories()->attach($categoryA->id));
        Budget::factory()->count(4)->create(['user_id' => $userB->id])
            ->each(fn ($b) => $b->categories()->attach($categoryB->id));

        $this->actingAs($userA)
            ->getJson('/api/v1/budgets')
            ->assertOk()
            ->assertJsonCount(2, 'data');
    }

    // ————————————————————————————————————————————
    // Store
    // ————————————————————————————————————————————

    public function test_user_can_create_monthly_budget(): void
    {
        $user     = User::factory()->create();
        $category = Category::factory()->for($user)->create();

        $payload = [
            'category_ids' => [$category->id],
            'amount'       => 50000,
            'period'       => 'monthly',
            'month'        => 4,
            'year'         => 2026,
        ];

        $this->actingAs($user)
            ->postJson('/api/v1/budgets', $payload)
            ->assertCreated()
            ->assertJsonPath('data.period', 'monthly')
            ->assertJsonPath('data.month', 4)
            ->assertJsonPath('data.amount', 50000)
            ->assertJsonCount(1, 'data.categories');
    }

    public function test_user_can_create_budget_with_multiple_categories(): void
    {
        $user  = User::factory()->create();
        $catA  = Category::factory()->for($user)->create();
        $catB  = Category::factory()->for($user)->create();

        $payload = [
            'category_ids' => [$catA->id, $catB->id],
            'amount'       => 80000,
            'period'       => 'monthly',
            'month'        => 4,
            'year'         => 2026,
        ];

        $this->actingAs($user)
            ->postJson('/api/v1/budgets', $payload)
            ->assertCreated()
            ->assertJsonCount(2, 'data.categories');
    }

    public function test_user_can_create_yearly_budget(): void
    {
        $user     = User::factory()->create();
        $category = Category::factory()->for($user)->create();

        $payload = [
            'category_ids' => [$category->id],
            'amount'       => 600000,
            'period'       => 'yearly',
            'year'         => 2026,
        ];

        $this->actingAs($user)
            ->postJson('/api/v1/budgets', $payload)
            ->assertCreated()
            ->assertJsonPath('data.period', 'yearly')
            ->assertJsonPath('data.month', null);
    }

    public function test_monthly_budget_requires_month(): void
    {
        $user     = User::factory()->create();
        $category = Category::factory()->for($user)->create();

        $this->actingAs($user)
            ->postJson('/api/v1/budgets', [
                'category_ids' => [$category->id],
                'amount'       => 10000,
                'period'       => 'monthly',
                'year'         => 2026,
                // month absent
            ])
            ->assertUnprocessable();
    }

    public function test_cannot_create_budget_for_other_user_category(): void
    {
        $userA     = User::factory()->create();
        $userB     = User::factory()->create();
        $categoryB = Category::factory()->for($userB)->create();

        $this->actingAs($userA)
            ->postJson('/api/v1/budgets', [
                'category_ids' => [$categoryB->id],
                'amount'       => 10000,
                'period'       => 'monthly',
                'month'        => 4,
                'year'         => 2026,
            ])
            ->assertUnprocessable();
    }

    // ————————————————————————————————————————————
    // Update
    // ————————————————————————————————————————————

    public function test_user_can_update_own_budget(): void
    {
        $user     = User::factory()->create();
        $category = Category::factory()->for($user)->create();
        $budget   = Budget::factory()->create(['user_id' => $user->id]);
        $budget->categories()->attach($category->id);

        $this->actingAs($user)
            ->patchJson("/api/v1/budgets/{$budget->id}", ['amount' => 99900])
            ->assertOk()
            ->assertJsonPath('data.amount', 99900);
    }

    public function test_user_can_update_categories_of_budget(): void
    {
        $user  = User::factory()->create();
        $catA  = Category::factory()->for($user)->create();
        $catB  = Category::factory()->for($user)->create();
        $catC  = Category::factory()->for($user)->create();
        $budget = Budget::factory()->create(['user_id' => $user->id]);
        $budget->categories()->attach([$catA->id, $catB->id]);

        $this->actingAs($user)
            ->patchJson("/api/v1/budgets/{$budget->id}", ['category_ids' => [$catC->id]])
            ->assertOk()
            ->assertJsonCount(1, 'data.categories');
    }

    public function test_user_cannot_update_other_user_budget(): void
    {
        $userA  = User::factory()->create();
        $userB  = User::factory()->create();
        $budget = Budget::factory()->create(['user_id' => $userB->id]);

        $this->actingAs($userA)
            ->patchJson("/api/v1/budgets/{$budget->id}", ['amount' => 99900])
            ->assertNotFound();
    }

    // ————————————————————————————————————————————
    // Destroy
    // ————————————————————————————————————————————

    public function test_user_can_delete_own_budget(): void
    {
        $user   = User::factory()->create();
        $budget = Budget::factory()->create(['user_id' => $user->id]);

        $this->actingAs($user)
            ->deleteJson("/api/v1/budgets/{$budget->id}")
            ->assertNoContent();

        $this->assertDatabaseMissing('budgets', ['id' => $budget->id]);
    }

    public function test_user_cannot_delete_other_user_budget(): void
    {
        $userA  = User::factory()->create();
        $userB  = User::factory()->create();
        $budget = Budget::factory()->create(['user_id' => $userB->id]);

        $this->actingAs($userA)
            ->deleteJson("/api/v1/budgets/{$budget->id}")
            ->assertNotFound();
    }

    // ————————————————————————————————————————————
    // Calcul spent / remaining
    // ————————————————————————————————————————————

    public function test_spent_sums_across_all_linked_categories(): void
    {
        $user   = User::factory()->create();
        $wallet = Wallet::factory()->for($user)->create();
        $catA   = Category::factory()->for($user)->create();
        $catB   = Category::factory()->for($user)->create();

        $budget = Budget::factory()->monthly(2026, 4)->create([
            'user_id' => $user->id,
            'amount'  => 100000,
        ]);
        $budget->categories()->attach([$catA->id, $catB->id]);

        Transaction::factory()->expense()->create([
            'user_id'     => $user->id,
            'wallet_id'   => $wallet->id,
            'category_id' => $catA->id,
            'amount'      => -30000,
            'date'        => '2026-04-10',
        ]);
        Transaction::factory()->expense()->create([
            'user_id'     => $user->id,
            'wallet_id'   => $wallet->id,
            'category_id' => $catB->id,
            'amount'      => -20000,
            'date'        => '2026-04-15',
        ]);

        $this->actingAs($user)
            ->getJson('/api/v1/budgets')
            ->assertOk()
            ->assertJsonPath('data.0.spent', 50000)
            ->assertJsonPath('data.0.remaining', 50000);
    }

    public function test_spent_excludes_transactions_outside_period(): void
    {
        $user     = User::factory()->create();
        $wallet   = Wallet::factory()->for($user)->create();
        $category = Category::factory()->for($user)->create();

        $budget = Budget::factory()->monthly(2026, 4)->create([
            'user_id' => $user->id,
            'amount'  => 100000,
        ]);
        $budget->categories()->attach($category->id);

        Transaction::factory()->expense()->create([
            'user_id'     => $user->id,
            'wallet_id'   => $wallet->id,
            'category_id' => $category->id,
            'amount'      => -30000,
            'date'        => '2026-04-10',
        ]);
        // Hors période
        Transaction::factory()->expense()->create([
            'user_id'     => $user->id,
            'wallet_id'   => $wallet->id,
            'category_id' => $category->id,
            'amount'      => -10000,
            'date'        => '2026-03-15',
        ]);

        $this->actingAs($user)
            ->getJson('/api/v1/budgets')
            ->assertOk()
            ->assertJsonPath('data.0.spent', 30000);
    }

    public function test_spent_excludes_income_transactions(): void
    {
        $user     = User::factory()->create();
        $wallet   = Wallet::factory()->for($user)->create();
        $category = Category::factory()->for($user)->create();

        $budget = Budget::factory()->monthly(2026, 4)->create([
            'user_id' => $user->id,
            'amount'  => 100000,
        ]);
        $budget->categories()->attach($category->id);

        Transaction::factory()->income()->create([
            'user_id'     => $user->id,
            'wallet_id'   => $wallet->id,
            'category_id' => $category->id,
            'amount'      => 50000,
            'date'        => '2026-04-10',
        ]);

        $this->actingAs($user)
            ->getJson('/api/v1/budgets')
            ->assertOk()
            ->assertJsonPath('data.0.spent', 0);
    }

    public function test_yearly_budget_sums_all_months_of_year(): void
    {
        $user     = User::factory()->create();
        $wallet   = Wallet::factory()->for($user)->create();
        $category = Category::factory()->for($user)->create();

        $budget = Budget::factory()->yearly(2026)->create([
            'user_id' => $user->id,
            'amount'  => 1200000,
        ]);
        $budget->categories()->attach($category->id);

        foreach ([1, 6, 12] as $month) {
            Transaction::factory()->expense()->create([
                'user_id'     => $user->id,
                'wallet_id'   => $wallet->id,
                'category_id' => $category->id,
                'amount'      => -100000,
                'date'        => "2026-{$month}-15",
            ]);
        }
        // Hors année
        Transaction::factory()->expense()->create([
            'user_id'     => $user->id,
            'wallet_id'   => $wallet->id,
            'category_id' => $category->id,
            'amount'      => -50000,
            'date'        => '2025-12-31',
        ]);

        $this->actingAs($user)
            ->getJson('/api/v1/budgets')
            ->assertOk()
            ->assertJsonPath('data.0.spent', 300000);
    }

    // ————————————————————————————————————————————
    // Alertes
    // ————————————————————————————————————————————

    public function test_alert_is_false_below_threshold(): void
    {
        $user     = User::factory()->create();
        $wallet   = Wallet::factory()->for($user)->create();
        $category = Category::factory()->for($user)->create();

        $budget = Budget::factory()->monthly(2026, 4)->create([
            'user_id'             => $user->id,
            'amount'              => 100000,
            'alert_threshold_pct' => 80,
        ]);
        $budget->categories()->attach($category->id);

        Transaction::factory()->expense()->create([
            'user_id'     => $user->id,
            'wallet_id'   => $wallet->id,
            'category_id' => $category->id,
            'amount'      => -70000,
            'date'        => '2026-04-10',
        ]);

        $this->actingAs($user)
            ->getJson('/api/v1/budgets')
            ->assertOk()
            ->assertJsonPath('data.0.alert', false)
            ->assertJsonPath('data.0.pct_used', 70);
    }

    public function test_alert_is_true_at_threshold(): void
    {
        $user     = User::factory()->create();
        $wallet   = Wallet::factory()->for($user)->create();
        $category = Category::factory()->for($user)->create();

        $budget = Budget::factory()->monthly(2026, 4)->create([
            'user_id'             => $user->id,
            'amount'              => 100000,
            'alert_threshold_pct' => 80,
        ]);
        $budget->categories()->attach($category->id);

        Transaction::factory()->expense()->create([
            'user_id'     => $user->id,
            'wallet_id'   => $wallet->id,
            'category_id' => $category->id,
            'amount'      => -80000,
            'date'        => '2026-04-10',
        ]);

        $this->actingAs($user)
            ->getJson('/api/v1/budgets')
            ->assertOk()
            ->assertJsonPath('data.0.alert', true);
    }

    public function test_alert_is_true_when_budget_exceeded(): void
    {
        $user     = User::factory()->create();
        $wallet   = Wallet::factory()->for($user)->create();
        $category = Category::factory()->for($user)->create();

        $budget = Budget::factory()->monthly(2026, 4)->create([
            'user_id'             => $user->id,
            'amount'              => 100000,
            'alert_threshold_pct' => 80,
        ]);
        $budget->categories()->attach($category->id);

        Transaction::factory()->expense()->create([
            'user_id'     => $user->id,
            'wallet_id'   => $wallet->id,
            'category_id' => $category->id,
            'amount'      => -120000,
            'date'        => '2026-04-10',
        ]);

        $this->actingAs($user)
            ->getJson('/api/v1/budgets')
            ->assertOk()
            ->assertJsonPath('data.0.alert', true)
            ->assertJsonPath('data.0.remaining', 0);
    }

    public function test_spent_only_counts_own_user_transactions(): void
    {
        $userA     = User::factory()->create();
        $userB     = User::factory()->create();
        $walletA   = Wallet::factory()->for($userA)->create();
        $walletB   = Wallet::factory()->for($userB)->create();
        $categoryA = Category::factory()->for($userA)->create();
        $categoryB = Category::factory()->for($userB)->create();

        $budget = Budget::factory()->monthly(2026, 4)->create([
            'user_id' => $userA->id,
            'amount'  => 100000,
        ]);
        $budget->categories()->attach($categoryA->id);

        Transaction::factory()->expense()->create([
            'user_id'     => $userA->id,
            'wallet_id'   => $walletA->id,
            'category_id' => $categoryA->id,
            'amount'      => -30000,
            'date'        => '2026-04-10',
        ]);
        Transaction::factory()->expense()->create([
            'user_id'     => $userB->id,
            'wallet_id'   => $walletB->id,
            'category_id' => $categoryB->id,
            'amount'      => -99000,
            'date'        => '2026-04-10',
        ]);

        $this->actingAs($userA)
            ->getJson('/api/v1/budgets')
            ->assertOk()
            ->assertJsonPath('data.0.spent', 30000);
    }
}
