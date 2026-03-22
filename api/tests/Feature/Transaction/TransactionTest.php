<?php

namespace Tests\Feature\Transaction;

use App\Models\Category;
use App\Models\Tag;
use App\Models\Transaction;
use App\Models\User;
use App\Models\Wallet;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Tests\TestCase;

class TransactionTest extends TestCase
{
    use RefreshDatabase;

    // ————————————————————————————————————————————
    // Authentification
    // ————————————————————————————————————————————

    public function test_unauthenticated_user_cannot_access_transactions(): void
    {
        $this->getJson('/api/v1/transactions')->assertUnauthorized();
        $this->postJson('/api/v1/transactions')->assertUnauthorized();
    }

    // ————————————————————————————————————————————
    // Index & Isolation multi-tenant
    // ————————————————————————————————————————————

    public function test_user_can_list_own_transactions(): void
    {
        $user   = User::factory()->create();
        $wallet = Wallet::factory()->for($user)->create();
        Transaction::factory()->count(3)->create(['user_id' => $user->id, 'wallet_id' => $wallet->id]);

        $this->actingAs($user)
            ->getJson('/api/v1/transactions')
            ->assertOk()
            ->assertJsonCount(3, 'data');
    }

    public function test_user_only_sees_own_transactions(): void
    {
        $userA   = User::factory()->create();
        $userB   = User::factory()->create();
        $walletA = Wallet::factory()->for($userA)->create();
        $walletB = Wallet::factory()->for($userB)->create();

        Transaction::factory()->count(2)->create(['user_id' => $userA->id, 'wallet_id' => $walletA->id]);
        Transaction::factory()->count(5)->create(['user_id' => $userB->id, 'wallet_id' => $walletB->id]);

        $this->actingAs($userA)
            ->getJson('/api/v1/transactions')
            ->assertOk()
            ->assertJsonCount(2, 'data');
    }

    public function test_user_cannot_view_another_users_transaction(): void
    {
        $userA = User::factory()->create();
        $userB = User::factory()->create();
        $wallet = Wallet::factory()->for($userB)->create();
        $transaction = Transaction::factory()->create(['user_id' => $userB->id, 'wallet_id' => $wallet->id]);

        $this->actingAs($userA)
            ->getJson("/api/v1/transactions/{$transaction->id}")
            ->assertNotFound();
    }

    // ————————————————————————————————————————————
    // Filtres
    // ————————————————————————————————————————————

    public function test_index_filters_by_wallet_id(): void
    {
        $user    = User::factory()->create();
        $walletA = Wallet::factory()->for($user)->create();
        $walletB = Wallet::factory()->for($user)->create();

        Transaction::factory()->count(2)->create(['user_id' => $user->id, 'wallet_id' => $walletA->id]);
        Transaction::factory()->count(3)->create(['user_id' => $user->id, 'wallet_id' => $walletB->id]);

        $this->actingAs($user)
            ->getJson("/api/v1/transactions?wallet_id={$walletA->id}")
            ->assertOk()
            ->assertJsonCount(2, 'data');
    }

    public function test_index_filters_by_type(): void
    {
        $user   = User::factory()->create();
        $wallet = Wallet::factory()->for($user)->create();

        Transaction::factory()->income()->count(2)->create(['user_id' => $user->id, 'wallet_id' => $wallet->id]);
        Transaction::factory()->expense()->count(4)->create(['user_id' => $user->id, 'wallet_id' => $wallet->id]);

        $this->actingAs($user)
            ->getJson('/api/v1/transactions?type=income')
            ->assertOk()
            ->assertJsonCount(2, 'data');
    }

    public function test_index_filters_by_status(): void
    {
        $user   = User::factory()->create();
        $wallet = Wallet::factory()->for($user)->create();

        Transaction::factory()->pending()->count(2)->create(['user_id' => $user->id, 'wallet_id' => $wallet->id]);
        Transaction::factory()->count(3)->create(['user_id' => $user->id, 'wallet_id' => $wallet->id]);

        $this->actingAs($user)
            ->getJson('/api/v1/transactions?status=pending')
            ->assertOk()
            ->assertJsonCount(2, 'data');
    }

    public function test_index_filters_by_date_range(): void
    {
        $user   = User::factory()->create();
        $wallet = Wallet::factory()->for($user)->create();

        Transaction::factory()->count(2)->create(['user_id' => $user->id, 'wallet_id' => $wallet->id, 'date' => '2024-03-15']);
        Transaction::factory()->count(3)->create(['user_id' => $user->id, 'wallet_id' => $wallet->id, 'date' => '2024-01-10']);

        $this->actingAs($user)
            ->getJson('/api/v1/transactions?date_from=2024-03-01&date_to=2024-03-31')
            ->assertOk()
            ->assertJsonCount(2, 'data');
    }

    public function test_index_searches_by_label(): void
    {
        $user   = User::factory()->create();
        $wallet = Wallet::factory()->for($user)->create();

        Transaction::factory()->create(['user_id' => $user->id, 'wallet_id' => $wallet->id, 'label' => 'Courses Monoprix']);
        Transaction::factory()->create(['user_id' => $user->id, 'wallet_id' => $wallet->id, 'label' => 'Loyer Janvier']);
        Transaction::factory()->create(['user_id' => $user->id, 'wallet_id' => $wallet->id, 'label' => 'COURSES Leclerc']);

        $this->actingAs($user)
            ->getJson('/api/v1/transactions?search=courses')
            ->assertOk()
            ->assertJsonCount(2, 'data');
    }

    // ————————————————————————————————————————————
    // Store
    // ————————————————————————————————————————————

    public function test_user_can_create_an_income_transaction(): void
    {
        $user   = User::factory()->create();
        $wallet = Wallet::factory()->for($user)->create();

        $this->actingAs($user)
            ->postJson('/api/v1/transactions', [
                'wallet_id' => $wallet->id,
                'label'     => 'Salaire mars',
                'amount'    => 250000,
                'type'      => 'income',
                'date'      => '2024-03-31',
            ])
            ->assertCreated()
            ->assertJsonPath('data.label', 'Salaire mars')
            ->assertJsonPath('data.type', 'income')
            ->assertJsonPath('data.amount', 250000);
    }

    public function test_income_amount_is_stored_as_positive(): void
    {
        $user   = User::factory()->create();
        $wallet = Wallet::factory()->for($user)->create();

        $this->actingAs($user)->postJson('/api/v1/transactions', [
            'wallet_id' => $wallet->id,
            'label'     => 'Virement reçu',
            'amount'    => 10000,
            'type'      => 'income',
            'date'      => '2024-03-01',
        ])->assertCreated();

        $this->assertDatabaseHas('transactions', ['label' => 'Virement reçu', 'amount' => 10000]);
    }

    public function test_expense_amount_is_stored_as_negative(): void
    {
        $user   = User::factory()->create();
        $wallet = Wallet::factory()->for($user)->create();

        $this->actingAs($user)->postJson('/api/v1/transactions', [
            'wallet_id' => $wallet->id,
            'label'     => 'Achat alimentaire',
            'amount'    => 5000,
            'type'      => 'expense',
            'date'      => '2024-03-01',
        ])->assertCreated();

        $this->assertDatabaseHas('transactions', ['label' => 'Achat alimentaire', 'amount' => -5000]);
    }

    public function test_store_updates_wallet_balance_cache(): void
    {
        $user   = User::factory()->create();
        $wallet = Wallet::factory()->for($user)->create(['balance_cache' => 0]);

        $this->actingAs($user)->postJson('/api/v1/transactions', [
            'wallet_id' => $wallet->id,
            'label'     => 'Loyer',
            'amount'    => 80000,
            'type'      => 'expense',
            'date'      => '2024-03-01',
        ])->assertCreated();

        $this->assertDatabaseHas('wallets', ['id' => $wallet->id, 'balance_cache' => -80000]);
    }

    public function test_transfer_updates_both_wallets_balance_cache(): void
    {
        $user    = User::factory()->create();
        $walletA = Wallet::factory()->for($user)->create(['balance_cache' => 0]);
        $walletB = Wallet::factory()->for($user)->create(['balance_cache' => 0]);

        $this->actingAs($user)->postJson('/api/v1/transactions', [
            'wallet_id'    => $walletA->id,
            'to_wallet_id' => $walletB->id,
            'label'        => 'Transfert épargne',
            'amount'       => 30000,
            'type'         => 'transfer',
            'date'         => '2024-03-01',
        ])->assertCreated();

        $this->assertDatabaseHas('wallets', ['id' => $walletA->id, 'balance_cache' => -30000]);
        $this->assertDatabaseHas('wallets', ['id' => $walletB->id, 'balance_cache' => 30000]);
    }

    public function test_store_attaches_tags_to_transaction(): void
    {
        $user   = User::factory()->create();
        $wallet = Wallet::factory()->for($user)->create();
        $tag1   = Tag::factory()->for($user)->create();
        $tag2   = Tag::factory()->for($user)->create();

        $response = $this->actingAs($user)->postJson('/api/v1/transactions', [
            'wallet_id' => $wallet->id,
            'label'     => 'Abonnement',
            'amount'    => 1500,
            'type'      => 'expense',
            'date'      => '2024-03-01',
            'tag_ids'   => [$tag1->id, $tag2->id],
        ])->assertCreated();

        $id = $response->json('data.id');
        $this->assertCount(2, Transaction::withoutGlobalScopes()->find($id)->tags);
    }

    public function test_user_cannot_create_transaction_with_another_users_wallet(): void
    {
        $userA  = User::factory()->create();
        $userB  = User::factory()->create();
        $wallet = Wallet::factory()->for($userB)->create();

        $this->actingAs($userA)
            ->postJson('/api/v1/transactions', [
                'wallet_id' => $wallet->id,
                'label'     => 'Hack',
                'amount'    => 1000,
                'type'      => 'expense',
                'date'      => '2024-03-01',
            ])
            ->assertUnprocessable();
    }

    public function test_user_cannot_use_another_users_category(): void
    {
        $userA    = User::factory()->create();
        $userB    = User::factory()->create();
        $wallet   = Wallet::factory()->for($userA)->create();
        $category = Category::factory()->for($userB)->expense()->create();

        $this->actingAs($userA)
            ->postJson('/api/v1/transactions', [
                'wallet_id'   => $wallet->id,
                'category_id' => $category->id,
                'label'       => 'Test',
                'amount'      => 1000,
                'type'        => 'expense',
                'date'        => '2024-03-01',
            ])
            ->assertUnprocessable();
    }

    public function test_user_can_use_system_category(): void
    {
        $user     = User::factory()->create();
        $wallet   = Wallet::factory()->for($user)->create();
        $category = Category::factory()->system()->expense()->create();

        $this->actingAs($user)
            ->postJson('/api/v1/transactions', [
                'wallet_id'   => $wallet->id,
                'category_id' => $category->id,
                'label'       => 'Courses',
                'amount'      => 5000,
                'type'        => 'expense',
                'date'        => '2024-03-01',
            ])
            ->assertCreated()
            ->assertJsonPath('data.category_id', $category->id);
    }

    // ————————————————————————————————————————————
    // Show
    // ————————————————————————————————————————————

    public function test_user_can_view_own_transaction(): void
    {
        $user        = User::factory()->create();
        $wallet      = Wallet::factory()->for($user)->create();
        $transaction = Transaction::factory()->create(['user_id' => $user->id, 'wallet_id' => $wallet->id]);

        $this->actingAs($user)
            ->getJson("/api/v1/transactions/{$transaction->id}")
            ->assertOk()
            ->assertJsonPath('data.id', $transaction->id);
    }

    // ————————————————————————————————————————————
    // Update
    // ————————————————————————————————————————————

    public function test_user_can_update_transaction(): void
    {
        $user        = User::factory()->create();
        $wallet      = Wallet::factory()->for($user)->create();
        $transaction = Transaction::factory()->create(['user_id' => $user->id, 'wallet_id' => $wallet->id]);

        $this->actingAs($user)
            ->patchJson("/api/v1/transactions/{$transaction->id}", ['label' => 'Nouveau libellé'])
            ->assertOk()
            ->assertJsonPath('data.label', 'Nouveau libellé');
    }

    public function test_update_recalculates_balance_cache(): void
    {
        $user   = User::factory()->create();
        $wallet = Wallet::factory()->for($user)->create(['balance_cache' => 0]);

        $response = $this->actingAs($user)->postJson('/api/v1/transactions', [
            'wallet_id' => $wallet->id,
            'label'     => 'Dépense initiale',
            'amount'    => 10000,
            'type'      => 'expense',
            'date'      => '2024-03-01',
        ])->assertCreated();

        $this->assertDatabaseHas('wallets', ['id' => $wallet->id, 'balance_cache' => -10000]);

        $id = $response->json('data.id');

        $this->actingAs($user)->patchJson("/api/v1/transactions/{$id}", ['amount' => 20000])->assertOk();

        $this->assertDatabaseHas('wallets', ['id' => $wallet->id, 'balance_cache' => -20000]);
    }

    public function test_user_cannot_update_another_users_transaction(): void
    {
        $userA       = User::factory()->create();
        $userB       = User::factory()->create();
        $wallet      = Wallet::factory()->for($userB)->create();
        $transaction = Transaction::factory()->create(['user_id' => $userB->id, 'wallet_id' => $wallet->id]);

        $this->actingAs($userA)
            ->patchJson("/api/v1/transactions/{$transaction->id}", ['label' => 'Hack'])
            ->assertNotFound();
    }

    // ————————————————————————————————————————————
    // Destroy
    // ————————————————————————————————————————————

    public function test_user_can_soft_delete_transaction(): void
    {
        $user        = User::factory()->create();
        $wallet      = Wallet::factory()->for($user)->create();
        $transaction = Transaction::factory()->create(['user_id' => $user->id, 'wallet_id' => $wallet->id]);

        $this->actingAs($user)
            ->deleteJson("/api/v1/transactions/{$transaction->id}")
            ->assertNoContent();

        $this->assertSoftDeleted('transactions', ['id' => $transaction->id]);
    }

    public function test_destroy_updates_wallet_balance_cache(): void
    {
        $user   = User::factory()->create();
        $wallet = Wallet::factory()->for($user)->create(['balance_cache' => 0]);

        $response = $this->actingAs($user)->postJson('/api/v1/transactions', [
            'wallet_id' => $wallet->id,
            'label'     => 'Dépense à supprimer',
            'amount'    => 5000,
            'type'      => 'expense',
            'date'      => '2024-03-01',
        ])->assertCreated();

        $this->assertDatabaseHas('wallets', ['id' => $wallet->id, 'balance_cache' => -5000]);

        $id = $response->json('data.id');
        $this->actingAs($user)->deleteJson("/api/v1/transactions/{$id}")->assertNoContent();

        $this->assertDatabaseHas('wallets', ['id' => $wallet->id, 'balance_cache' => 0]);
    }

    public function test_user_cannot_delete_another_users_transaction(): void
    {
        $userA       = User::factory()->create();
        $userB       = User::factory()->create();
        $wallet      = Wallet::factory()->for($userB)->create();
        $transaction = Transaction::factory()->create(['user_id' => $userB->id, 'wallet_id' => $wallet->id]);

        $this->actingAs($userA)
            ->deleteJson("/api/v1/transactions/{$transaction->id}")
            ->assertNotFound();
    }

    // ————————————————————————————————————————————
    // Bulk Delete
    // ————————————————————————————————————————————

    public function test_user_can_bulk_delete_transactions(): void
    {
        $user   = User::factory()->create();
        $wallet = Wallet::factory()->for($user)->create();
        $t1     = Transaction::factory()->create(['user_id' => $user->id, 'wallet_id' => $wallet->id]);
        $t2     = Transaction::factory()->create(['user_id' => $user->id, 'wallet_id' => $wallet->id]);

        $this->actingAs($user)
            ->postJson('/api/v1/transactions/bulk-delete', ['ids' => [$t1->id, $t2->id]])
            ->assertNoContent();

        $this->assertSoftDeleted('transactions', ['id' => $t1->id]);
        $this->assertSoftDeleted('transactions', ['id' => $t2->id]);
    }

    public function test_bulk_delete_rejects_other_users_transactions(): void
    {
        $userA  = User::factory()->create();
        $userB  = User::factory()->create();
        $wallet = Wallet::factory()->for($userB)->create();
        $own    = Transaction::factory()->create(['user_id' => $userA->id, 'wallet_id' => Wallet::factory()->for($userA)->create()->id]);
        $other  = Transaction::factory()->create(['user_id' => $userB->id, 'wallet_id' => $wallet->id]);

        $this->actingAs($userA)
            ->postJson('/api/v1/transactions/bulk-delete', ['ids' => [$own->id, $other->id]])
            ->assertForbidden();

        $this->assertNotSoftDeleted('transactions', ['id' => $own->id]);
    }

    // ————————————————————————————————————————————
    // Export CSV
    // ————————————————————————————————————————————

    public function test_user_can_export_transactions_as_csv(): void
    {
        $user   = User::factory()->create();
        $wallet = Wallet::factory()->for($user)->create();
        Transaction::factory()->count(3)->create(['user_id' => $user->id, 'wallet_id' => $wallet->id]);

        $response = $this->actingAs($user)->get('/api/v1/transactions/export');

        $response->assertOk();
        $response->assertHeader('Content-Type', 'text/csv; charset=UTF-8');
        $this->assertStringContainsString('Date', $response->streamedContent());
    }

    public function test_export_only_includes_own_transactions(): void
    {
        $userA   = User::factory()->create();
        $userB   = User::factory()->create();
        $walletA = Wallet::factory()->for($userA)->create();
        $walletB = Wallet::factory()->for($userB)->create();

        Transaction::factory()->create(['user_id' => $userA->id, 'wallet_id' => $walletA->id, 'label' => 'Ma transaction']);
        Transaction::factory()->create(['user_id' => $userB->id, 'wallet_id' => $walletB->id, 'label' => 'Transaction B']);

        $content = $this->actingAs($userA)->get('/api/v1/transactions/export')->streamedContent();

        $this->assertStringContainsString('Ma transaction', $content);
        $this->assertStringNotContainsString('Transaction B', $content);
    }

    // ————————————————————————————————————————————
    // Import CSV
    // ————————————————————————————————————————————

    public function test_import_preview_returns_columns_and_rows(): void
    {
        $user = User::factory()->create();
        $csv  = "Date;Libellé;Montant\n2024-01-15;Courses;-45.50\n2024-01-16;Salaire;2500.00\n";
        $file = UploadedFile::fake()->createWithContent('transactions.csv', $csv);

        $this->actingAs($user)
            ->postJson('/api/v1/transactions/import', ['file' => $file])
            ->assertOk()
            ->assertJsonPath('total_rows', 2)
            ->assertJsonCount(3, 'columns');
    }

    public function test_import_confirm_inserts_transactions(): void
    {
        $user   = User::factory()->create();
        $wallet = Wallet::factory()->for($user)->create();
        $csv    = "Date;Label;Amount\n2024-01-15;Courses Monoprix;45.50\n2024-01-16;Boulangerie;3.20\n";
        $file   = UploadedFile::fake()->createWithContent('transactions.csv', $csv);

        $this->actingAs($user)
            ->postJson('/api/v1/transactions/import/confirm', [
                'file'      => $file,
                'wallet_id' => $wallet->id,
                'mapping'   => ['date' => 'Date', 'label' => 'Label', 'amount' => 'Amount'],
            ])
            ->assertOk()
            ->assertJsonPath('imported', 2)
            ->assertJsonPath('skipped', 0);

        $this->assertDatabaseCount('transactions', 2);
    }

    public function test_import_confirm_skips_duplicate_transactions(): void
    {
        $user   = User::factory()->create();
        $wallet = Wallet::factory()->for($user)->create();

        // Première import
        $csv  = "Date;Label;Amount\n2024-01-15;Courses;45.50\n";
        $file = UploadedFile::fake()->createWithContent('transactions.csv', $csv);

        $this->actingAs($user)->postJson('/api/v1/transactions/import/confirm', [
            'file'      => $file,
            'wallet_id' => $wallet->id,
            'mapping'   => ['date' => 'Date', 'label' => 'Label', 'amount' => 'Amount'],
        ])->assertOk()->assertJsonPath('imported', 1);

        // Deuxième import identique
        $file2 = UploadedFile::fake()->createWithContent('transactions.csv', $csv);

        $this->actingAs($user)->postJson('/api/v1/transactions/import/confirm', [
            'file'      => $file2,
            'wallet_id' => $wallet->id,
            'mapping'   => ['date' => 'Date', 'label' => 'Label', 'amount' => 'Amount'],
        ])->assertOk()
            ->assertJsonPath('imported', 0)
            ->assertJsonPath('skipped', 1);

        $this->assertDatabaseCount('transactions', 1);
    }

    public function test_import_cannot_use_another_users_wallet(): void
    {
        $userA  = User::factory()->create();
        $userB  = User::factory()->create();
        $wallet = Wallet::factory()->for($userB)->create();
        $csv    = "Date;Label;Amount\n2024-01-15;Test;10.00\n";
        $file   = UploadedFile::fake()->createWithContent('transactions.csv', $csv);

        $this->actingAs($userA)
            ->postJson('/api/v1/transactions/import/confirm', [
                'file'      => $file,
                'wallet_id' => $wallet->id,
                'mapping'   => ['date' => 'Date', 'label' => 'Label', 'amount' => 'Amount'],
            ])
            ->assertUnprocessable();
    }
}
