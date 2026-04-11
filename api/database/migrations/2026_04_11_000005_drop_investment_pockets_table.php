<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('investment_pockets');
    }

    public function down(): void
    {
        // Recreate if rollback needed — see migration 2026_04_11_000003
    }
};
