<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('recurring_rules', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('wallet_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('category_id')->nullable()->constrained()->nullOnDelete();

            $table->string('label');
            $table->integer('amount'); // en centimes, toujours positif
            $table->string('type');    // income | expense | transfer

            $table->string('frequency'); // daily | weekly | monthly | yearly
            $table->unsignedTinyInteger('day_of_month')->nullable(); // 1-31
            $table->unsignedTinyInteger('day_of_week')->nullable();  // 0-6 (0 = dimanche)

            $table->date('starts_at');
            $table->date('ends_at')->nullable();
            $table->date('last_generated_at')->nullable();

            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('recurring_rules');
    }
};
