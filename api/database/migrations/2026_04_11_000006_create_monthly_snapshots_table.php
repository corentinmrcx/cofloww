<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('monthly_snapshots', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->unsignedSmallInteger('year');
            $table->unsignedTinyInteger('month');
            $table->integer('total_income')->default(0);    // cents
            $table->integer('total_expenses')->default(0);  // cents, valeur positive
            $table->integer('net')->default(0);             // cents
            $table->integer('net_worth')->default(0);       // cents
            $table->decimal('savings_rate', 5, 2)->default(0); // %
            $table->jsonb('wallet_balances')->nullable();
            $table->jsonb('categories_breakdown')->nullable();
            $table->timestamps();

            $table->unique(['user_id', 'year', 'month']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('monthly_snapshots');
    }
};
