<?php

namespace Database\Seeders;

use App\Enums\TransactionType;
use App\Models\Budget;
use App\Models\Category;
use App\Models\RecurringRule;
use App\Models\Transaction;
use App\Models\User;
use App\Models\Wallet;
use App\Services\TransactionService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

class DemoSeeder extends Seeder
{
    public function __construct(private TransactionService $transactionService) {}

    public function run(): void
    {
        $user = User::firstOrCreate(
            ['email' => 'test@example.com'],
            [
                'firstname' => 'Admin',
                'lastname'  => 'Admin',
                'password'  => bcrypt('password'),
            ]
        );

        // ——————————————————————————————————————
        // Wallets
        // ——————————————————————————————————————

        $checking = Wallet::firstOrCreate(
            ['user_id' => $user->id, 'slug' => 'compte-courant'],
            [
                'name'            => 'Compte courant',
                'type'            => 'checking',
                'color'           => '#6366F1',
                'icon'            => 'landmark',
                'institution'     => 'BNP Paribas',
                'is_default'      => true,
                'is_archived'     => false,
                'sort_order'      => 0,
                'initial_balance' => 150000,
                'balance_cache'   => 150000,
            ]
        );

        $savings = Wallet::firstOrCreate(
            ['user_id' => $user->id, 'slug' => 'epargne'],
            [
                'name'            => 'Épargne',
                'type'            => 'savings',
                'color'           => '#22C55E',
                'icon'            => 'piggy-bank',
                'institution'     => 'Livret A',
                'is_default'      => false,
                'is_archived'     => false,
                'sort_order'      => 1,
                'initial_balance' => 500000,
                'balance_cache'   => 500000,
            ]
        );

        $cash = Wallet::firstOrCreate(
            ['user_id' => $user->id, 'slug' => 'especes'],
            [
                'name'            => 'Espèces',
                'type'            => 'cash',
                'color'           => '#F59E0B',
                'icon'            => 'wallet',
                'institution'     => null,
                'is_default'      => false,
                'is_archived'     => false,
                'sort_order'      => 2,
                'initial_balance' => 20000,
                'balance_cache'   => 20000,
            ]
        );

        // ——————————————————————————————————————
        // Catégories système
        // ——————————————————————————————————————

        $catAlim      = $this->cat('alimentation');
        $catTransport = $this->cat('transport');
        $catLogement  = $this->cat('logement');
        $catLoisirs   = $this->cat('loisirs');
        $catSante     = $this->cat('sante');
        $catAbos      = $this->cat('abonnements');
        $catSalaire   = $this->cat('salaire');
        $catVirement  = $this->cat('virement');

        // ——————————————————————————————————————
        // Transactions — 3 derniers mois
        // ——————————————————————————————————————

        $today = Carbon::today();

        foreach (range(2, 0) as $monthsAgo) {
            $base = $today->copy()->subMonths($monthsAgo);
            $m    = str_pad((string) $base->month, 2, '0', STR_PAD_LEFT);
            $y    = $base->year;

            $this->tx($user->id, $checking->id, $catSalaire->id,   'Salaire',          280000, 'income',   "$y-$m-01");
            $this->tx($user->id, $checking->id, $catLogement->id,  'Loyer',             90000, 'expense',  "$y-$m-03");
            $this->tx($user->id, $checking->id, $catVirement->id,  'Virement épargne',  30000, 'expense',  "$y-$m-05");
            $this->tx($user->id, $checking->id, $catAbos->id,      'Netflix',            1399, 'expense',  "$y-$m-06");
            $this->tx($user->id, $checking->id, $catAbos->id,      'Spotify',            1099, 'expense',  "$y-$m-06");
            $this->tx($user->id, $checking->id, $catAbos->id,      'Amazon Prime',        699, 'expense',  "$y-$m-07");
            $this->tx($user->id, $checking->id, $catTransport->id, 'Navigo mensuel',     8480, 'expense',  "$y-$m-04");
            $this->tx($user->id, $checking->id, $catTransport->id, 'Essence',            6200, 'expense',  "$y-$m-15");
            $this->tx($user->id, $checking->id, $catAlim->id,      'Carrefour',          8750, 'expense',  "$y-$m-08");
            $this->tx($user->id, $checking->id, $catAlim->id,      'Lidl',               4320, 'expense',  "$y-$m-12");
            $this->tx($user->id, $checking->id, $catAlim->id,      'Monoprix',           5640, 'expense',  "$y-$m-17");
            $this->tx($user->id, $checking->id, $catAlim->id,      'Marché',             2800, 'expense',  "$y-$m-20");
            $this->tx($user->id, $cash->id,     $catAlim->id,      'Boulangerie',         850, 'expense',  "$y-$m-22");
            $this->tx($user->id, $checking->id, $catLoisirs->id,   'Cinéma',             2400, 'expense',  "$y-$m-10");
            $this->tx($user->id, $cash->id,     $catLoisirs->id,   'Restaurant',         6800, 'expense',  "$y-$m-14");
            $this->tx($user->id, $checking->id, $catLoisirs->id,   'Fnac',               1990, 'expense',  "$y-$m-18");
            $this->tx($user->id, $checking->id, $catSante->id,     'Pharmacie',          3200, 'expense',  "$y-$m-09");
        }

        // Recalcul des soldes
        $this->transactionService->recalculateCache($checking->id);
        $this->transactionService->recalculateCache($cash->id);

        // ——————————————————————————————————————
        // Récurrences
        // ——————————————————————————————————————

        $this->recurring($user->id, $checking->id, $catLogement->id,  'Loyer',           90000, 'expense', 'monthly', 3);
        $this->recurring($user->id, $checking->id, $catSalaire->id,   'Salaire',        280000, 'income',  'monthly', 1);
        $this->recurring($user->id, $checking->id, $catAbos->id,      'Netflix',          1399, 'expense', 'monthly', 6);
        $this->recurring($user->id, $checking->id, $catAbos->id,      'Spotify',          1099, 'expense', 'monthly', 6);
        $this->recurring($user->id, $checking->id, $catTransport->id, 'Navigo mensuel',   8480, 'expense', 'monthly', 4);

        // ——————————————————————————————————————
        // Budgets — mois courant
        // ——————————————————————————————————————

        $this->budget($user->id, [$catAlim->id],      60000, $today->month, $today->year);
        $this->budget($user->id, [$catTransport->id], 20000, $today->month, $today->year);
        $this->budget($user->id, [$catLoisirs->id],   20000, $today->month, $today->year);
        $this->budget($user->id, [$catAbos->id],       5000, $today->month, $today->year);
        $this->budget($user->id, [$catSante->id],     10000, $today->month, $today->year);
    }

    // ——————————————————————————————————————
    // Helpers
    // ——————————————————————————————————————

    private function cat(string $slug): Category
    {
        return Category::withoutGlobalScopes()
            ->where('slug', $slug)
            ->whereNull('user_id')
            ->firstOrFail();
    }

    private function tx(
        int $userId,
        string $walletId,
        string $categoryId,
        string $label,
        int $amount,
        string $type,
        string $date,
    ): void {
        $signed = match (TransactionType::from($type)) {
            TransactionType::Income   =>  abs($amount),
            TransactionType::Expense  => -abs($amount),
            TransactionType::Transfer => -abs($amount),
        };

        Transaction::create([
            'user_id'      => $userId,
            'wallet_id'    => $walletId,
            'category_id'  => $categoryId,
            'label'        => $label,
            'amount'       => $signed,
            'type'         => $type,
            'date'         => $date,
            'status'       => 'cleared',
            'is_recurring' => false,
        ]);
    }

    private function recurring(
        int $userId,
        string $walletId,
        string $categoryId,
        string $label,
        int $amount,
        string $type,
        string $frequency,
        int $dayOfMonth,
    ): void {
        RecurringRule::firstOrCreate(
            ['user_id' => $userId, 'label' => $label, 'type' => $type],
            [
                'wallet_id'    => $walletId,
                'category_id'  => $categoryId,
                'amount'       => $amount,
                'frequency'    => $frequency,
                'day_of_month' => $dayOfMonth,
                'starts_at'    => now()->subMonths(3)->startOfMonth()->toDateString(),
                'is_active'    => true,
            ]
        );
    }

    private function budget(int $userId, array $categoryIds, int $amount, int $month, int $year): void
    {
        $budget = Budget::firstOrCreate(
            ['user_id' => $userId, 'amount' => $amount, 'period' => 'monthly', 'month' => $month, 'year' => $year],
            [
                'alert_threshold_pct' => 80,
                'is_active'           => true,
            ]
        );

        $budget->categories()->syncWithoutDetaching($categoryIds);
    }
}
