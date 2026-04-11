<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class InvestmentPocketFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id'     => User::factory(),
            'wallet_id'   => null,
            'name'        => fake()->word(),
            'target_pct'  => fake()->randomFloat(2, 5, 50),
            'color'       => fake()->hexColor(),
            'icon'        => null,
            'description' => null,
            'sort_order'  => 0,
        ];
    }
}
