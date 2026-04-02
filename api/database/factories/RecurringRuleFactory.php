<?php

namespace Database\Factories;

use App\Enums\RecurringFrequency;
use App\Enums\TransactionType;
use App\Models\User;
use App\Models\Wallet;
use Illuminate\Database\Eloquent\Factories\Factory;

class RecurringRuleFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id'            => User::factory(),
            'wallet_id'          => Wallet::factory(),
            'category_id'        => null,
            'label'              => fake()->sentence(3),
            'amount'             => fake()->numberBetween(100, 100000),
            'type'               => TransactionType::Expense->value,
            'frequency'          => RecurringFrequency::Monthly->value,
            'day_of_month'       => null,
            'day_of_week'        => null,
            'starts_at'          => now()->subMonths(3)->toDateString(),
            'ends_at'            => null,
            'last_generated_at'  => null,
            'is_active'          => true,
        ];
    }

    public function daily(): static
    {
        return $this->state(['frequency' => RecurringFrequency::Daily->value]);
    }

    public function weekly(): static
    {
        return $this->state(['frequency' => RecurringFrequency::Weekly->value]);
    }

    public function monthly(): static
    {
        return $this->state(['frequency' => RecurringFrequency::Monthly->value]);
    }

    public function yearly(): static
    {
        return $this->state(['frequency' => RecurringFrequency::Yearly->value]);
    }

    public function inactive(): static
    {
        return $this->state(['is_active' => false]);
    }
}
