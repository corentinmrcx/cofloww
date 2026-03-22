<?php

namespace Database\Factories;

use App\Enums\TransactionStatus;
use App\Enums\TransactionType;
use App\Models\User;
use App\Models\Wallet;
use Illuminate\Database\Eloquent\Factories\Factory;

class TransactionFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id'           => User::factory(),
            'wallet_id'         => Wallet::factory(),
            'category_id'       => null,
            'to_wallet_id'      => null,
            'label'             => fake()->sentence(3),
            'notes'             => null,
            'amount'            => -fake()->numberBetween(100, 100000), // expense par défaut
            'type'              => TransactionType::Expense->value,
            'date'              => fake()->dateTimeBetween('-1 year')->format('Y-m-d'),
            'value_date'        => null,
            'is_recurring'      => false,
            'recurring_rule_id' => null,
            'status'            => TransactionStatus::Cleared->value,
            'metadata'          => null,
        ];
    }

    public function income(): static
    {
        return $this->state(fn (array $attrs) => [
            'type'   => TransactionType::Income->value,
            'amount' => abs($attrs['amount']),
        ]);
    }

    public function expense(): static
    {
        return $this->state(fn (array $attrs) => [
            'type'   => TransactionType::Expense->value,
            'amount' => -abs($attrs['amount']),
        ]);
    }

    public function pending(): static
    {
        return $this->state(['status' => TransactionStatus::Pending->value]);
    }
}
