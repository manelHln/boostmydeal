<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('credits', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->integer('balance')->default(0); // Current credit balance
            $table->integer('total_purchased')->default(0); // Total credits purchased
            $table->integer('total_used')->default(0); // Total credits used
            $table->timestamp('last_reset_at')->nullable(); // Last time balance was reset
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('credits');
    }
};
