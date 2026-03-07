<?php

namespace Database\Factories;

use App\Enums\WalletType;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Wallet>
 */
class WalletFactory extends Factory
{
    public function definition(): array
    {
        $name = fake()->words(2, true);

        return [
            'user_id'         => User::factory(),
            'name'            => ucfirst($name),
            'slug'            => Str::slug($name),
            'type'            => fake()->randomElement(WalletType::cases())->value,
            'color'           => fake()->hexColor(),
            'icon'            => null,
            'institution'     => fake()->optional()->company(),
            'is_default'      => false,
            'is_archived'     => false,
            'sort_order'      => 0,
            'initial_balance' => fake()->randomFloat(2, 0, 10000),
            'balance_cache'   => 0,
        ];
    }
}
