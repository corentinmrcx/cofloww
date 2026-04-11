<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('investment_pockets', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('wallet_id')->nullable()->constrained()->nullOnDelete();

            $table->string('name');
            $table->decimal('target_pct', 5, 2); // ex: 55.00 pour 55 %
            $table->string('color')->default('#6366F1');
            $table->string('icon')->nullable();
            $table->string('description')->nullable();
            $table->unsignedSmallInteger('sort_order')->default(0);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('investment_pockets');
    }
};
