<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = json_decode(
            file_get_contents(database_path('seeders/data/categories.json')),
            true
        );

        foreach ($categories as $data) {
            Category::withoutGlobalScopes()->updateOrCreate(
                [
                    'user_id'   => null,
                    'slug'      => Str::slug($data['name']),
                    'type'      => $data['type'],
                ],
                [
                    'name'       => $data['name'],
                    'color'      => $data['color'],
                    'icon'       => $data['icon'],
                    'is_system'  => true,
                    'sort_order' => 0,
                ]
            );
        }
    }
}
