<?php

namespace Tests\Unit;

use App\Models\Category;
use App\Models\MonthlySnapshot;
use App\Models\Transaction;
use App\Models\User;
use App\Models\Wallet;
use App\Services\SnapshotService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SnapshotServiceTest extends TestCase
{
    use RefreshDatabase;

    private SnapshotService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new SnapshotService();
    }

    public function test_compute_aggregates_income_and_expenses(): void
    {
        $user   = User::factory()->create();
        $wallet = Wallet::factory()->for($user)->create(['initial_balance' => 0, 'balance_cache' => 0]);

        $year  = 2026;
        $month = 3;

        Transaction::factory()->income()->create([
            'user_id' => $user->id, 'wallet_id' => $wallet->id,
            'amount' => 300000, 'date' => '2026-03-15',
        ]);
        Transaction::factory()->expense()->create([
            'user_id' => $user->id, 'wallet_id' => $wallet->id,
            'amount' => -80000, 'date' => '2026-03-20',
        ]);
        // Transaction hors du mois — ne doit pas être incluse
        Transaction::factory()->income()->create([
            'user_id' => $user->id, 'wallet_id' => $wallet->id,
            'amount' => 999999, 'date' => '2026-04-01',
        ]);

        $result = $this->service->compute($user->id, $year, $month);

        $this->assertSame(300000, $result['total_income']);
        $this->assertSame(80000,  $result['total_expenses']);
        $this->assertSame(220000, $result['net']);
        $this->assertEqualsWithDelta(73.33, $result['savings_rate'], 0.01);
    }

    public function test_compute_calculates_net_worth_at_end_of_month(): void
    {
        $user    = User::factory()->create();
        $walletA = Wallet::factory()->for($user)->create(['initial_balance' => 100000, 'balance_cache' => 0, 'is_archived' => false]);
        $walletB = Wallet::factory()->for($user)->create(['initial_balance' => 50000,  'balance_cache' => 0, 'is_archived' => false]);

        // Transaction en mars
        Transaction::factory()->income()->create([
            'user_id' => $user->id, 'wallet_id' => $walletA->id,
            'amount' => 20000, 'date' => '2026-03-10',
        ]);
        // Transaction en avril — ne compte pas pour net_worth mars
        Transaction::factory()->income()->create([
            'user_id' => $user->id, 'wallet_id' => $walletA->id,
            'amount' => 99999, 'date' => '2026-04-05',
        ]);

        $result = $this->service->compute($user->id, 2026, 3);

        // walletA: 100000 + 20000 = 120000 | walletB: 50000 → total = 170000
        $this->assertSame(170000, $result['net_worth']);
    }

    public function test_compute_savings_rate_is_zero_when_no_income(): void
    {
        $user   = User::factory()->create();
        $wallet = Wallet::factory()->for($user)->create();

        Transaction::factory()->expense()->create([
            'user_id' => $user->id, 'wallet_id' => $wallet->id,
            'amount' => -5000, 'date' => '2026-03-01',
        ]);

        $result = $this->service->compute($user->id, 2026, 3);

        $this->assertSame(0.0, $result['savings_rate']);
    }

    public function test_persist_for_user_creates_snapshot(): void
    {
        $user   = User::factory()->create();
        $wallet = Wallet::factory()->for($user)->create(['initial_balance' => 0, 'balance_cache' => 0]);

        Transaction::factory()->income()->create([
            'user_id' => $user->id, 'wallet_id' => $wallet->id,
            'amount' => 100000, 'date' => '2026-03-01',
        ]);

        $snapshot = $this->service->persistForUser($user->id, 2026, 3);

        $this->assertInstanceOf(MonthlySnapshot::class, $snapshot);
        $this->assertDatabaseHas('monthly_snapshots', [
            'user_id'      => $user->id,
            'year'         => 2026,
            'month'        => 3,
            'total_income' => 100000,
        ]);
    }

    public function test_persist_for_user_updates_existing_snapshot(): void
    {
        $user   = User::factory()->create();
        $wallet = Wallet::factory()->for($user)->create(['initial_balance' => 0, 'balance_cache' => 0]);

        Transaction::factory()->income()->create([
            'user_id' => $user->id, 'wallet_id' => $wallet->id,
            'amount' => 100000, 'date' => '2026-03-01',
        ]);
        $this->service->persistForUser($user->id, 2026, 3);

        // Nouvelle transaction — on recalcule
        Transaction::factory()->income()->create([
            'user_id' => $user->id, 'wallet_id' => $wallet->id,
            'amount' => 50000, 'date' => '2026-03-15',
        ]);
        $this->service->persistForUser($user->id, 2026, 3);

        $this->assertDatabaseCount('monthly_snapshots', 1);
        $this->assertDatabaseHas('monthly_snapshots', ['total_income' => 150000]);
    }
}
