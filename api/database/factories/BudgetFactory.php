<?php

namespace Database\Factories;

use App\Enums\BudgetPeriod;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class BudgetFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id'             => User::factory(),
            'amount'              => fake()->numberBetween(5000, 500000), // centimes
            'period'              => BudgetPeriod::Monthly->value,
            'month'               => fake()->numberBetween(1, 12),
            'year'                => (int) fake()->year(),
            'alert_threshold_pct' => 80,
            'is_active'           => true,
        ];
    }

    public function monthly(int $year, int $month): static
    {
        return $this->state([
            'period' => BudgetPeriod::Monthly->value,
            'month'  => $month,
            'year'   => $year,
        ]);
    }

    public function yearly(int $year): static
    {
        return $this->state([
            'period' => BudgetPeriod::Yearly->value,
            'month'  => null,
            'year'   => $year,
        ]);
    }

    public function inactive(): static
    {
        return $this->state(['is_active' => false]);
    }
}
