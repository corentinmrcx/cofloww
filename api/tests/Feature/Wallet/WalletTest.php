<?php

namespace Tests\Feature\Wallet;

use App\Models\User;
use App\Models\Wallet;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class WalletTest extends TestCase
{
    use RefreshDatabase;

    // -------------------------------------------------------------------------
    // Authentification
    // -------------------------------------------------------------------------

    public function test_unauthenticated_user_cannot_access_wallets(): void
    {
        $this->getJson('/api/v1/wallets')->assertUnauthorized();
    }

    // -------------------------------------------------------------------------
    // Isolation multi-tenant (le plus important)
    // -------------------------------------------------------------------------

    public function test_user_only_sees_own_wallets_on_index(): void
    {
        $userA = User::factory()->create();
        $userB = User::factory()->create();

        Wallet::factory()->for($userA)->create(['name' => 'Wallet A']);
        Wallet::factory()->for($userB)->create(['name' => 'Wallet B']);

        $this->actingAs($userA)
            ->getJson('/api/v1/wallets')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.name', 'Wallet A');
    }

    public function test_user_cannot_view_another_users_wallet(): void
    {
        $userA = User::factory()->create();
        $userB = User::factory()->create();

        $wallet = Wallet::factory()->for($userB)->create();

        $this->actingAs($userA)
            ->getJson("/api/v1/wallets/{$wallet->id}")
            ->assertNotFound();
    }

    public function test_user_cannot_update_another_users_wallet(): void
    {
        $userA = User::factory()->create();
        $userB = User::factory()->create();

        $wallet = Wallet::factory()->for($userB)->create();

        $this->actingAs($userA)
            ->patchJson("/api/v1/wallets/{$wallet->id}", ['name' => 'Hacked'])
            ->assertNotFound();
    }

    public function test_user_cannot_archive_another_users_wallet(): void
    {
        $userA = User::factory()->create();
        $userB = User::factory()->create();

        $wallet = Wallet::factory()->for($userB)->create();

        $this->actingAs($userA)
            ->deleteJson("/api/v1/wallets/{$wallet->id}")
            ->assertNotFound();
    }

    public function test_user_cannot_reorder_another_users_wallets(): void
    {
        $userA = User::factory()->create();
        $userB = User::factory()->create();

        $wallet = Wallet::factory()->for($userB)->create();

        $this->actingAs($userA)
            ->postJson('/api/v1/wallets/reorder', [
                'wallets' => [['id' => $wallet->id, 'sort_order' => 0]],
            ])
            ->assertUnprocessable();
    }

    // -------------------------------------------------------------------------
    // CRUD
    // -------------------------------------------------------------------------

    public function test_user_can_list_wallets(): void
    {
        $user = User::factory()->create();
        Wallet::factory()->for($user)->count(3)->create();

        $this->actingAs($user)
            ->getJson('/api/v1/wallets')
            ->assertOk()
            ->assertJsonCount(3, 'data');
    }

    public function test_user_can_create_a_wallet(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->postJson('/api/v1/wallets', [
                'name' => 'Compte courant',
                'type' => 'checking',
            ])
            ->assertCreated()
            ->assertJsonPath('data.name', 'Compte courant')
            ->assertJsonPath('data.type', 'checking');
    }

    public function test_store_generates_slug_from_name(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->postJson('/api/v1/wallets', [
                'name' => 'Mon Épargne',
                'type' => 'savings',
            ])
            ->assertCreated()
            ->assertJsonPath('data.slug', 'mon-epargne');
    }

    public function test_store_sets_only_one_default_wallet(): void
    {
        $user = User::factory()->create();
        Wallet::factory()->for($user)->create(['is_default' => true]);

        $this->actingAs($user)
            ->postJson('/api/v1/wallets', [
                'name'       => 'Nouveau défaut',
                'type'       => 'checking',
                'is_default' => true,
            ])
            ->assertCreated();

        $this->assertDatabaseCount('wallets', 2);
        $this->assertEquals(1, Wallet::withoutGlobalScopes()->where('user_id', $user->id)->where('is_default', true)->count());
    }

    public function test_user_can_update_own_wallet(): void
    {
        $user   = User::factory()->create();
        $wallet = Wallet::factory()->for($user)->create();

        $this->actingAs($user)
            ->patchJson("/api/v1/wallets/{$wallet->id}", ['name' => 'Nouveau nom'])
            ->assertOk()
            ->assertJsonPath('data.name', 'Nouveau nom');
    }

    public function test_destroy_archives_wallet_instead_of_deleting(): void
    {
        $user   = User::factory()->create();
        $wallet = Wallet::factory()->for($user)->create();

        $this->actingAs($user)
            ->deleteJson("/api/v1/wallets/{$wallet->id}")
            ->assertNoContent();

        $this->assertDatabaseHas('wallets', ['id' => $wallet->id, 'is_archived' => true]);
    }

    public function test_user_can_reorder_wallets(): void
    {
        $user    = User::factory()->create();
        $walletA = Wallet::factory()->for($user)->create(['sort_order' => 0]);
        $walletB = Wallet::factory()->for($user)->create(['sort_order' => 1]);

        $this->actingAs($user)
            ->postJson('/api/v1/wallets/reorder', [
                'wallets' => [
                    ['id' => $walletA->id, 'sort_order' => 1],
                    ['id' => $walletB->id, 'sort_order' => 0],
                ],
            ])
            ->assertNoContent();

        $this->assertDatabaseHas('wallets', ['id' => $walletA->id, 'sort_order' => 1]);
        $this->assertDatabaseHas('wallets', ['id' => $walletB->id, 'sort_order' => 0]);
    }
}
