<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class CategoryFactory extends Factory
{
    public function definition(): array
    {
        $name = fake()->words(2, true);

        return [
            'user_id'    => User::factory(),
            'name'       => ucfirst($name),
            'slug'       => Str::slug($name),
            'color'      => fake()->hexColor(),
            'icon'       => null,
            'parent_id'  => null,
            'is_system'  => false,
            'sort_order' => 0,
        ];
    }

    public function system(): static
    {
        return $this->state(['user_id' => null, 'is_system' => true]);
    }
}
