<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('goals', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('wallet_id')->constrained()->cascadeOnDelete();

            $table->string('name');
            $table->string('color')->nullable();

            $table->date('start_date');
            $table->date('end_date')->nullable(); // null = récurrent indéfini

            $table->integer('total_target')->nullable();   // en centimes
            $table->integer('monthly_target')->nullable(); // en centimes

            $table->boolean('is_active')->default(true);

            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('goals');
    }
};
