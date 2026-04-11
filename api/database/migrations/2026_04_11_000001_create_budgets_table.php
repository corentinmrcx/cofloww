<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('budgets', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();

            $table->integer('amount'); // en centimes, toujours positif
            $table->string('period');  // monthly | yearly

            $table->unsignedTinyInteger('month')->nullable(); // 1-12, null si yearly
            $table->unsignedSmallInteger('year');

            $table->unsignedTinyInteger('alert_threshold_pct')->default(80); // 0-100
            $table->boolean('is_active')->default(true);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('budgets');
    }
};
