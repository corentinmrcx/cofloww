<?php

namespace App\Services;

use App\Models\Tag;

class TagService
{
    public function store(array $data, int $userId): Tag
    {
        return Tag::create([
            ...$data,
            'user_id' => $userId,
        ]);
    }

    public function update(Tag $tag, array $data): Tag
    {
        $tag->update($data);

        return $tag->fresh();
    }

    public function destroy(Tag $tag): void
    {
        $tag->delete();
    }
}
