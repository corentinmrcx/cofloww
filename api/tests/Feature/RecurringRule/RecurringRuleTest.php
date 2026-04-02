<?php

namespace Tests\Feature\RecurringRule;

use App\Models\RecurringRule;
use App\Models\User;
use App\Models\Wallet;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RecurringRuleTest extends TestCase
{
    use RefreshDatabase;

    // ————————————————————————————————————————————
    // Authentification
    // ————————————————————————————————————————————

    public function test_unauthenticated_user_cannot_access_recurring_rules(): void
    {
        $this->getJson('/api/v1/recurring-rules')->assertUnauthorized();
        $this->postJson('/api/v1/recurring-rules')->assertUnauthorized();
    }

    // ————————————————————————————————————————————
    // Index & isolation multi-tenant
    // ————————————————————————————————————————————

    public function test_user_can_list_own_rules(): void
    {
        $user   = User::factory()->create();
        $wallet = Wallet::factory()->for($user)->create();

        RecurringRule::factory()->count(2)->create(['user_id' => $user->id, 'wallet_id' => $wallet->id]);

        $this->actingAs($user)
            ->getJson('/api/v1/recurring-rules')
            ->assertOk()
            ->assertJsonCount(2, 'data');
    }

    public function test_user_only_sees_own_rules(): void
    {
        $userA   = User::factory()->create();
        $userB   = User::factory()->create();
        $walletA = Wallet::factory()->for($userA)->create();
        $walletB = Wallet::factory()->for($userB)->create();

        RecurringRule::factory()->count(2)->create(['user_id' => $userA->id, 'wallet_id' => $walletA->id]);
        RecurringRule::factory()->count(5)->create(['user_id' => $userB->id, 'wallet_id' => $walletB->id]);

        $this->actingAs($userA)
            ->getJson('/api/v1/recurring-rules')
            ->assertOk()
            ->assertJsonCount(2, 'data');
    }

    // ————————————————————————————————————————————
    // Store
    // ————————————————————————————————————————————

    public function test_user_can_create_a_recurring_rule(): void
    {
        $user   = User::factory()->create();
        $wallet = Wallet::factory()->for($user)->create();

        $this->actingAs($user)
            ->postJson('/api/v1/recurring-rules', [
                'wallet_id'  => $wallet->id,
                'label'      => 'Loyer',
                'amount'     => 80000,
                'type'       => 'expense',
                'frequency'  => 'monthly',
                'starts_at'  => '2026-01-01',
                'day_of_month' => 1,
            ])
            ->assertCreated()
            ->assertJsonPath('data.label', 'Loyer')
            ->assertJsonPath('data.frequency', 'monthly')
            ->assertJsonPath('data.amount', 80000)
            ->assertJsonStructure(['data' => ['next_occurrence']]);
    }

    public function test_store_requires_wallet_belonging_to_user(): void
    {
        $userA  = User::factory()->create();
        $userB  = User::factory()->create();
        $wallet = Wallet::factory()->for($userB)->create();

        $this->actingAs($userA)
            ->postJson('/api/v1/recurring-rules', [
                'wallet_id' => $wallet->id,
                'label'     => 'Hack',
                'amount'    => 1000,
                'type'      => 'expense',
                'frequency' => 'monthly',
                'starts_at' => '2026-01-01',
            ])
            ->assertUnprocessable();
    }

    public function test_store_validates_frequency_enum(): void
    {
        $user   = User::factory()->create();
        $wallet = Wallet::factory()->for($user)->create();

        $this->actingAs($user)
            ->postJson('/api/v1/recurring-rules', [
                'wallet_id' => $wallet->id,
                'label'     => 'Test',
                'amount'    => 1000,
                'type'      => 'expense',
                'frequency' => 'hourly', // invalide
                'starts_at' => '2026-01-01',
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['frequency']);
    }

    // ————————————————————————————————————————————
    // Update
    // ————————————————————————————————————————————

    public function test_user_can_update_own_rule(): void
    {
        $user   = User::factory()->create();
        $wallet = Wallet::factory()->for($user)->create();
        $rule   = RecurringRule::factory()->create(['user_id' => $user->id, 'wallet_id' => $wallet->id]);

        $this->actingAs($user)
            ->patchJson("/api/v1/recurring-rules/{$rule->id}", ['label' => 'Nouveau libellé'])
            ->assertOk()
            ->assertJsonPath('data.label', 'Nouveau libellé');
    }

    public function test_user_can_deactivate_a_rule(): void
    {
        $user   = User::factory()->create();
        $wallet = Wallet::factory()->for($user)->create();
        $rule   = RecurringRule::factory()->create(['user_id' => $user->id, 'wallet_id' => $wallet->id]);

        $this->actingAs($user)
            ->patchJson("/api/v1/recurring-rules/{$rule->id}", ['is_active' => false])
            ->assertOk()
            ->assertJsonPath('data.is_active', false);
    }

    public function test_user_cannot_update_another_users_rule(): void
    {
        $userA   = User::factory()->create();
        $userB   = User::factory()->create();
        $walletB = Wallet::factory()->for($userB)->create();
        $rule    = RecurringRule::factory()->create(['user_id' => $userB->id, 'wallet_id' => $walletB->id]);

        $this->actingAs($userA)
            ->patchJson("/api/v1/recurring-rules/{$rule->id}", ['label' => 'Hack'])
            ->assertNotFound();
    }

    // ————————————————————————————————————————————
    // Destroy
    // ————————————————————————————————————————————

    public function test_user_can_delete_own_rule(): void
    {
        $user   = User::factory()->create();
        $wallet = Wallet::factory()->for($user)->create();
        $rule   = RecurringRule::factory()->create(['user_id' => $user->id, 'wallet_id' => $wallet->id]);

        $this->actingAs($user)
            ->deleteJson("/api/v1/recurring-rules/{$rule->id}")
            ->assertNoContent();

        $this->assertDatabaseMissing('recurring_rules', ['id' => $rule->id]);
    }

    public function test_user_cannot_delete_another_users_rule(): void
    {
        $userA   = User::factory()->create();
        $userB   = User::factory()->create();
        $walletB = Wallet::factory()->for($userB)->create();
        $rule    = RecurringRule::factory()->create(['user_id' => $userB->id, 'wallet_id' => $walletB->id]);

        $this->actingAs($userA)
            ->deleteJson("/api/v1/recurring-rules/{$rule->id}")
            ->assertNotFound();

        $this->assertDatabaseHas('recurring_rules', ['id' => $rule->id]);
    }

    // ————————————————————————————————————————————
    // next_occurrence dans la Resource
    // ————————————————————————————————————————————

    public function test_response_includes_next_occurrence_for_never_generated_rule(): void
    {
        $user   = User::factory()->create();
        $wallet = Wallet::factory()->for($user)->create();

        $response = $this->actingAs($user)
            ->postJson('/api/v1/recurring-rules', [
                'wallet_id' => $wallet->id,
                'label'     => 'Abonnement',
                'amount'    => 1500,
                'type'      => 'expense',
                'frequency' => 'monthly',
                'starts_at' => '2026-06-15',
            ])
            ->assertCreated();

        $this->assertEquals('2026-06-15', $response->json('data.next_occurrence'));
    }

    public function test_next_occurrence_is_null_when_ends_at_is_past(): void
    {
        $user   = User::factory()->create();
        $wallet = Wallet::factory()->for($user)->create();

        RecurringRule::factory()->create([
            'user_id'           => $user->id,
            'wallet_id'         => $wallet->id,
            'frequency'         => 'monthly',
            'starts_at'         => '2025-01-01',
            'ends_at'           => '2025-12-31',
            'last_generated_at' => '2025-12-01',
        ]);

        $this->actingAs($user)
            ->getJson('/api/v1/recurring-rules')
            ->assertOk()
            ->assertJsonPath('data.0.next_occurrence', null);
    }
}
