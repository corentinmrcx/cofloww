<?php

namespace App\Services;

use App\Models\Category;
use Illuminate\Support\Str;

class CategoryService
{
    public function store(array $data, int $userId): Category
    {
        return Category::create([
            ...$data,
            'user_id' => $userId,
            'slug'    => $this->uniqueSlug($data['name'], $userId),
        ]);
    }

    public function update(Category $category, array $data): Category
    {
        abort_if($category->is_system, 403, 'System categories cannot be modified.');

        if (isset($data['name'])) {
            $data['slug'] = $this->uniqueSlug($data['name'], $category->user_id, $category->id);
        }

        $category->update($data);

        return $category->fresh();
    }

    public function destroy(Category $category): void
    {
        abort_if($category->is_system, 403, 'System categories cannot be deleted.');

        $category->delete();
    }

    private function uniqueSlug(string $name, int $userId, ?string $excludeId = null): string
    {
        $base  = Str::slug($name);
        $slug  = $base;
        $count = 1;

        while (
            Category::withoutGlobalScopes()
                ->where('user_id', $userId)
                ->where('slug', $slug)
                ->when($excludeId, fn ($q) => $q->where('id', '!=', $excludeId))
                ->exists()
        ) {
            $slug = "{$base}-{$count}";
            $count++;
        }

        return $slug;
    }
}
