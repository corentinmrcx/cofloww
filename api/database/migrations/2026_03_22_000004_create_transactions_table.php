<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('transactions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();

            $table->uuid('wallet_id');
            $table->uuid('category_id')->nullable();
            $table->uuid('to_wallet_id')->nullable();

            $table->string('label');
            $table->text('notes')->nullable();
            $table->integer('amount'); // en centimes

            $table->enum('type', ['income', 'expense', 'transfer']);
            $table->date('date');
            $table->date('value_date')->nullable();

            $table->boolean('is_recurring')->default(false);
            $table->uuid('recurring_rule_id')->nullable();

            $table->enum('status', ['pending', 'cleared', 'reconciled'])->default('cleared');
            $table->jsonb('metadata')->nullable();

            $table->timestamps();
            $table->softDeletes();

            $table->foreign('wallet_id')->references('id')->on('wallets')->cascadeOnDelete();
            $table->foreign('category_id')->references('id')->on('categories')->nullOnDelete();
            $table->foreign('to_wallet_id')->references('id')->on('wallets')->nullOnDelete();

            $table->index(['user_id', 'date']);
            $table->index(['wallet_id', 'date']);
        });

        // FK différée depuis la migration transaction_tag
        Schema::table('transaction_tag', function (Blueprint $table) {
            $table->foreign('transaction_id')->references('id')->on('transactions')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('transaction_tag', function (Blueprint $table) {
            $table->dropForeign(['transaction_id']);
        });

        Schema::dropIfExists('transactions');
    }
};
