<?php

namespace Tests\Unit\RecurringRule;

use App\Jobs\RecurringTransactionJob;
use App\Models\RecurringRule;
use App\Models\User;
use App\Models\Wallet;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Tests\TestCase;

class RecurringTransactionJobTest extends TestCase
{
    use RefreshDatabase;

    protected function tearDown(): void
    {
        Carbon::setTestNow();
        parent::tearDown();
    }

    private function makeRule(array $overrides = []): RecurringRule
    {
        $user   = User::factory()->create();
        $wallet = Wallet::factory()->for($user)->create(['balance_cache' => 0]);

        return RecurringRule::factory()->create(array_merge([
            'user_id'   => $user->id,
            'wallet_id' => $wallet->id,
            'amount'    => 5000,
            'type'      => 'expense',
        ], $overrides));
    }

    // ————————————————————————————————————————————
    // Daily
    // ————————————————————————————————————————————

    public function test_daily_rule_generates_transaction_the_next_day(): void
    {
        Carbon::setTestNow('2026-04-02');

        $rule = $this->makeRule([
            'frequency'         => 'daily',
            'starts_at'         => '2026-04-01',
            'last_generated_at' => '2026-04-01',
        ]);

        (new RecurringTransactionJob())->handle(app(\App\Services\TransactionService::class));

        $this->assertDatabaseHas('transactions', [
            'recurring_rule_id' => $rule->id,
            'date'              => '2026-04-02',
        ]);

        $this->assertDatabaseHas('recurring_rules', [
            'id'                => $rule->id,
            'last_generated_at' => '2026-04-02',
        ]);
    }

    public function test_daily_rule_does_not_generate_when_not_due(): void
    {
        Carbon::setTestNow('2026-04-02');

        $this->makeRule([
            'frequency'         => 'daily',
            'starts_at'         => '2026-04-01',
            'last_generated_at' => '2026-04-02', // déjà généré aujourd'hui
        ]);

        (new RecurringTransactionJob())->handle(app(\App\Services\TransactionService::class));

        $this->assertDatabaseCount('transactions', 0);
    }

    // ————————————————————————————————————————————
    // Weekly
    // ————————————————————————————————————————————

    public function test_weekly_rule_generates_transaction_7_days_later(): void
    {
        Carbon::setTestNow('2026-04-02');

        $rule = $this->makeRule([
            'frequency'         => 'weekly',
            'starts_at'         => '2026-03-26',
            'last_generated_at' => '2026-03-26',
        ]);

        (new RecurringTransactionJob())->handle(app(\App\Services\TransactionService::class));

        $this->assertDatabaseHas('transactions', [
            'recurring_rule_id' => $rule->id,
            'date'              => '2026-04-02',
        ]);

        $this->assertDatabaseHas('recurring_rules', [
            'id'                => $rule->id,
            'last_generated_at' => '2026-04-02',
        ]);
    }

    public function test_weekly_rule_does_not_generate_before_due_date(): void
    {
        Carbon::setTestNow('2026-04-01'); // 6 jours après le dernier

        $this->makeRule([
            'frequency'         => 'weekly',
            'starts_at'         => '2026-03-26',
            'last_generated_at' => '2026-03-26',
        ]);

        (new RecurringTransactionJob())->handle(app(\App\Services\TransactionService::class));

        $this->assertDatabaseCount('transactions', 0);
    }

    // ————————————————————————————————————————————
    // Monthly
    // ————————————————————————————————————————————

    public function test_monthly_rule_generates_transaction_one_month_later(): void
    {
        Carbon::setTestNow('2026-04-02');

        $rule = $this->makeRule([
            'frequency'         => 'monthly',
            'starts_at'         => '2026-03-02',
            'last_generated_at' => '2026-03-02',
        ]);

        (new RecurringTransactionJob())->handle(app(\App\Services\TransactionService::class));

        $this->assertDatabaseHas('transactions', [
            'recurring_rule_id' => $rule->id,
            'date'              => '2026-04-02',
        ]);
    }

    public function test_monthly_rule_respects_day_of_month(): void
    {
        Carbon::setTestNow('2026-04-15');

        $rule = $this->makeRule([
            'frequency'         => 'monthly',
            'day_of_month'      => 15,
            'starts_at'         => '2026-03-15',
            'last_generated_at' => '2026-03-15',
        ]);

        (new RecurringTransactionJob())->handle(app(\App\Services\TransactionService::class));

        $this->assertDatabaseHas('transactions', [
            'recurring_rule_id' => $rule->id,
            'date'              => '2026-04-15',
        ]);
    }

    public function test_monthly_rule_clamps_day_of_month_to_end_of_month(): void
    {
        // day_of_month = 31, mais février n'a que 28 jours
        Carbon::setTestNow('2026-02-28');

        $rule = $this->makeRule([
            'frequency'         => 'monthly',
            'day_of_month'      => 31,
            'starts_at'         => '2026-01-31',
            'last_generated_at' => '2026-01-31',
        ]);

        (new RecurringTransactionJob())->handle(app(\App\Services\TransactionService::class));

        $this->assertDatabaseHas('transactions', [
            'recurring_rule_id' => $rule->id,
            'date'              => '2026-02-28',
        ]);
    }

    public function test_monthly_rule_does_not_generate_before_due_date(): void
    {
        Carbon::setTestNow('2026-04-01'); // un jour trop tôt

        $this->makeRule([
            'frequency'         => 'monthly',
            'starts_at'         => '2026-03-02',
            'last_generated_at' => '2026-03-02',
        ]);

        (new RecurringTransactionJob())->handle(app(\App\Services\TransactionService::class));

        $this->assertDatabaseCount('transactions', 0);
    }

    // ————————————————————————————————————————————
    // Yearly
    // ————————————————————————————————————————————

    public function test_yearly_rule_generates_transaction_one_year_later(): void
    {
        Carbon::setTestNow('2026-04-02');

        $rule = $this->makeRule([
            'frequency'         => 'yearly',
            'starts_at'         => '2025-04-02',
            'last_generated_at' => '2025-04-02',
        ]);

        (new RecurringTransactionJob())->handle(app(\App\Services\TransactionService::class));

        $this->assertDatabaseHas('transactions', [
            'recurring_rule_id' => $rule->id,
            'date'              => '2026-04-02',
        ]);

        $this->assertDatabaseHas('recurring_rules', [
            'id'                => $rule->id,
            'last_generated_at' => '2026-04-02',
        ]);
    }

    public function test_yearly_rule_does_not_generate_before_due_date(): void
    {
        Carbon::setTestNow('2026-04-01');

        $this->makeRule([
            'frequency'         => 'yearly',
            'starts_at'         => '2025-04-02',
            'last_generated_at' => '2025-04-02',
        ]);

        (new RecurringTransactionJob())->handle(app(\App\Services\TransactionService::class));

        $this->assertDatabaseCount('transactions', 0);
    }

    // ————————————————————————————————————————————
    // Première génération (jamais générée)
    // ————————————————————————————————————————————

    public function test_rule_generates_on_starts_at_when_never_generated(): void
    {
        Carbon::setTestNow('2026-04-02');

        $rule = $this->makeRule([
            'frequency'         => 'monthly',
            'starts_at'         => '2026-04-02',
            'last_generated_at' => null,
        ]);

        (new RecurringTransactionJob())->handle(app(\App\Services\TransactionService::class));

        $this->assertDatabaseHas('transactions', [
            'recurring_rule_id' => $rule->id,
            'date'              => '2026-04-02',
        ]);
    }

    public function test_rule_does_not_generate_before_starts_at(): void
    {
        Carbon::setTestNow('2026-04-01');

        $this->makeRule([
            'frequency'         => 'monthly',
            'starts_at'         => '2026-04-02',
            'last_generated_at' => null,
        ]);

        (new RecurringTransactionJob())->handle(app(\App\Services\TransactionService::class));

        $this->assertDatabaseCount('transactions', 0);
    }

    // ————————————————————————————————————————————
    // Règles inactives / expirées
    // ————————————————————————————————————————————

    public function test_inactive_rule_is_skipped(): void
    {
        Carbon::setTestNow('2026-04-02');

        $this->makeRule([
            'frequency'         => 'monthly',
            'starts_at'         => '2026-03-02',
            'last_generated_at' => '2026-03-02',
            'is_active'         => false,
        ]);

        (new RecurringTransactionJob())->handle(app(\App\Services\TransactionService::class));

        $this->assertDatabaseCount('transactions', 0);
    }

    public function test_expired_rule_is_skipped(): void
    {
        Carbon::setTestNow('2026-04-02');

        $this->makeRule([
            'frequency'         => 'monthly',
            'starts_at'         => '2026-03-02',
            'ends_at'           => '2026-04-01', // expiré hier
            'last_generated_at' => '2026-03-02',
        ]);

        (new RecurringTransactionJob())->handle(app(\App\Services\TransactionService::class));

        $this->assertDatabaseCount('transactions', 0);
    }

    // ————————————————————————————————————————————
    // Effets sur le wallet
    // ————————————————————————————————————————————

    public function test_generated_transaction_updates_wallet_balance_cache(): void
    {
        Carbon::setTestNow('2026-04-02');

        $rule = $this->makeRule([
            'frequency'         => 'monthly',
            'starts_at'         => '2026-03-02',
            'last_generated_at' => '2026-03-02',
            'amount'            => 80000,
            'type'              => 'expense',
        ]);

        (new RecurringTransactionJob())->handle(app(\App\Services\TransactionService::class));

        $this->assertDatabaseHas('wallets', [
            'id'            => $rule->wallet_id,
            'balance_cache' => -80000,
        ]);
    }

    public function test_generated_transaction_is_marked_as_recurring(): void
    {
        Carbon::setTestNow('2026-04-02');

        $rule = $this->makeRule([
            'frequency'         => 'monthly',
            'starts_at'         => '2026-03-02',
            'last_generated_at' => '2026-03-02',
        ]);

        (new RecurringTransactionJob())->handle(app(\App\Services\TransactionService::class));

        $this->assertDatabaseHas('transactions', [
            'recurring_rule_id' => $rule->id,
            'is_recurring'      => true,
        ]);
    }

    // ————————————————————————————————————————————
    // Isolation multi-utilisateurs
    // ————————————————————————————————————————————

    public function test_job_processes_rules_from_multiple_users(): void
    {
        Carbon::setTestNow('2026-04-02');

        $rule1 = $this->makeRule(['frequency' => 'monthly', 'starts_at' => '2026-03-02', 'last_generated_at' => '2026-03-02']);
        $rule2 = $this->makeRule(['frequency' => 'monthly', 'starts_at' => '2026-03-02', 'last_generated_at' => '2026-03-02']);

        (new RecurringTransactionJob())->handle(app(\App\Services\TransactionService::class));

        $this->assertDatabaseHas('transactions', ['recurring_rule_id' => $rule1->id]);
        $this->assertDatabaseHas('transactions', ['recurring_rule_id' => $rule2->id]);
    }
}
