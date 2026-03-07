<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('wallets', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();

            $table->string('name');
            $table->string('slug');
            $table->enum('type', ['checking', 'savings', 'cash', 'investment', 'crypto']);
            $table->string('color', 7)->nullable();
            $table->string('icon')->nullable();
            $table->string('institution')->nullable();

            $table->boolean('is_default')->default(false);
            $table->boolean('is_archived')->default(false);
            $table->unsignedInteger('sort_order')->default(0);

            $table->decimal('initial_balance', 15, 2)->default(0);
            $table->decimal('balance_cache', 15, 2)->default(0);

            $table->timestamps();

            $table->unique(['user_id', 'slug']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('wallets');
    }
};
