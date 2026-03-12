<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('wallets', function (Blueprint $table) {
            $table->bigInteger('initial_balance')->default(0)->change();
            $table->bigInteger('balance_cache')->default(0)->change();
        });
    }

    public function down(): void
    {
        Schema::table('wallets', function (Blueprint $table) {
            $table->decimal('initial_balance', 15, 2)->default(0)->change();
            $table->decimal('balance_cache', 15, 2)->default(0)->change();
        });
    }
};
