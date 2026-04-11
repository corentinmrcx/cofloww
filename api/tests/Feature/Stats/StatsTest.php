<?php

namespace Tests\Feature\Stats;

use App\Models\Category;
use App\Models\Transaction;
use App\Models\User;
use App\Models\Wallet;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StatsTest extends TestCase
{
    use RefreshDatabase;

    // ──────────────────────────────────────────────
    // Auth
    // ──────────────────────────────────────────────

    public function test_unauthenticated_cannot_access_stats(): void
    {
        $this->getJson('/api/v1/stats/income-vs-expenses')->assertUnauthorized();
        $this->getJson('/api/v1/stats/expenses-by-category')->assertUnauthorized();
        $this->getJson('/api/v1/stats/overview')->assertUnauthorized();
    }

    // ──────────────────────────────────────────────
    // income-vs-expenses
    // ──────────────────────────────────────────────

    public function test_income_vs_expenses_returns_correct_monthly_aggregates(): void
    {
        $user   = User::factory()->create();
        $wallet = Wallet::factory()->for($user)->create();

        $thisMonth = now()->startOfMonth();

        // 2 000 € de revenus, 800 € de dépenses ce mois
        Transaction::factory()->income()->create([
            'user_id'   => $user->id,
            'wallet_id' => $wallet->id,
            'amount'    => 200000,
            'date'      => $thisMonth->toDateString(),
        ]);
        Transaction::factory()->expense()->create([
            'user_id'   => $user->id,
            'wallet_id' => $wallet->id,
            'amount'    => -80000,
            'date'      => $thisMonth->toDateString(),
        ]);

        $response = $this->actingAs($user)
            ->getJson('/api/v1/stats/income-vs-expenses?period=3m')
            ->assertOk();

        $data = $response->json('data');
        $this->assertCount(3, $data);

        $current = collect($data)->first(
            fn ($r) => $r['year'] === $thisMonth->year && $r['month'] === $thisMonth->month
        );
        $this->assertNotNull($current);
        $this->assertSame(200000, $current['income']);
        $this->assertSame(80000,  $current['expenses']);
        $this->assertSame(120000, $current['net']);
    }

    public function test_income_vs_expenses_months_with_no_data_are_included(): void
    {
        $user = User::factory()->create();

        $data = $this->actingAs($user)
            ->getJson('/api/v1/stats/income-vs-expenses?period=6m')
            ->assertOk()
            ->json('data');

        $this->assertCount(6, $data);
        foreach ($data as $row) {
            $this->assertSame(0, $row['income']);
            $this->assertSame(0, $row['expenses']);
        }
    }

    public function test_income_vs_expenses_does_not_leak_other_user_data(): void
    {
        $userA  = User::factory()->create();
        $userB  = User::factory()->create();
        $wallet = Wallet::factory()->for($userB)->create();

        Transaction::factory()->income()->create([
            'user_id'   => $userB->id,
            'wallet_id' => $wallet->id,
            'amount'    => 500000,
            'date'      => now()->toDateString(),
        ]);

        $data = $this->actingAs($userA)
            ->getJson('/api/v1/stats/income-vs-expenses?period=3m')
            ->assertOk()
            ->json('data');

        foreach ($data as $row) {
            $this->assertSame(0, $row['income']);
        }
    }

    public function test_income_vs_expenses_rejects_invalid_period(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->getJson('/api/v1/stats/income-vs-expenses?period=99m')
            ->assertUnprocessable();
    }

    // ──────────────────────────────────────────────
    // expenses-by-category
    // ──────────────────────────────────────────────

    public function test_expenses_by_category_aggregates_correctly(): void
    {
        $user     = User::factory()->create();
        $wallet   = Wallet::factory()->for($user)->create();
        $catFood  = Category::factory()->for($user)->create(['name' => 'Alimentation', 'color' => '#ff0000']);
        $catHome  = Category::factory()->for($user)->create(['name' => 'Logement',     'color' => '#0000ff']);

        $today = now()->toDateString();

        Transaction::factory()->expense()->create([
            'user_id' => $user->id, 'wallet_id' => $wallet->id,
            'category_id' => $catFood->id, 'amount' => -30000, 'date' => $today,
        ]);
        Transaction::factory()->expense()->create([
            'user_id' => $user->id, 'wallet_id' => $wallet->id,
            'category_id' => $catFood->id, 'amount' => -20000, 'date' => $today,
        ]);
        Transaction::factory()->expense()->create([
            'user_id' => $user->id, 'wallet_id' => $wallet->id,
            'category_id' => $catHome->id, 'amount' => -100000, 'date' => $today,
        ]);

        $data = $this->actingAs($user)
            ->getJson('/api/v1/stats/expenses-by-category')
            ->assertOk()
            ->json('data');

        // Trié par montant décroissant
        $this->assertSame($catHome->id, $data[0]['category_id']);
        $this->assertSame(100000, $data[0]['amount']);

        $this->assertSame($catFood->id, $data[1]['category_id']);
        $this->assertSame(50000, $data[1]['amount']);
    }

    public function test_expenses_by_category_excludes_income_transactions(): void
    {
        $user   = User::factory()->create();
        $wallet = Wallet::factory()->for($user)->create();

        Transaction::factory()->income()->create([
            'user_id' => $user->id, 'wallet_id' => $wallet->id,
            'amount' => 500000, 'date' => now()->toDateString(),
        ]);

        $data = $this->actingAs($user)
            ->getJson('/api/v1/stats/expenses-by-category')
            ->assertOk()
            ->json('data');

        $this->assertCount(0, $data);
    }

    // ──────────────────────────────────────────────
    // overview
    // ──────────────────────────────────────────────

    public function test_overview_computes_savings_rate_correctly(): void
    {
        $user   = User::factory()->create();
        $wallet = Wallet::factory()->for($user)->create(['initial_balance' => 0, 'balance_cache' => 0]);

        $today = now()->toDateString();

        // Revenu 1 000 €, dépense 200 € → savings_rate = 80%
        Transaction::factory()->income()->create([
            'user_id' => $user->id, 'wallet_id' => $wallet->id,
            'amount' => 100000, 'date' => $today,
        ]);
        Transaction::factory()->expense()->create([
            'user_id' => $user->id, 'wallet_id' => $wallet->id,
            'amount' => -20000, 'date' => $today,
        ]);

        $this->actingAs($user)
            ->getJson('/api/v1/stats/overview')
            ->assertOk()
            ->assertJsonPath('data.savings_rate', 80);
    }

    public function test_overview_net_worth_sums_non_archived_wallets(): void
    {
        $user = User::factory()->create();

        Wallet::factory()->for($user)->create(['initial_balance' => 100000, 'balance_cache' => 50000, 'is_archived' => false]);
        Wallet::factory()->for($user)->create(['initial_balance' => 200000, 'balance_cache' => 0,     'is_archived' => false]);
        Wallet::factory()->for($user)->create(['initial_balance' => 999999, 'balance_cache' => 0,     'is_archived' => true]);

        $this->actingAs($user)
            ->getJson('/api/v1/stats/overview')
            ->assertOk()
            ->assertJsonPath('data.net_worth', 350000); // 150k + 200k
    }

    public function test_overview_returns_zero_savings_rate_when_no_income(): void
    {
        $user   = User::factory()->create();
        $wallet = Wallet::factory()->for($user)->create();

        Transaction::factory()->expense()->create([
            'user_id' => $user->id, 'wallet_id' => $wallet->id,
            'amount' => -10000, 'date' => now()->toDateString(),
        ]);

        $this->actingAs($user)
            ->getJson('/api/v1/stats/overview')
            ->assertOk()
            ->assertJsonPath('data.savings_rate', 0);
    }
}
