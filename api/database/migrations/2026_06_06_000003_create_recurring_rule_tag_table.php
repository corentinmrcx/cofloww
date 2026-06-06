<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('recurring_rule_tag', function (Blueprint $table) {
            $table->foreignUuid('recurring_rule_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('tag_id')->constrained()->cascadeOnDelete();
            $table->primary(['recurring_rule_id', 'tag_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('recurring_rule_tag');
    }
};
