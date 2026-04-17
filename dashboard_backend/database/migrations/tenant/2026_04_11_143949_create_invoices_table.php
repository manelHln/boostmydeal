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
        Schema::create('invoices', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('stripe_invoice_id')->nullable()->unique();
            $table->string('invoice_number')->unique(); // Human-readable invoice number
            $table->unsignedBigInteger('amount'); //? Amount in cents
            $table->string('currency')->default('usd');
            $table->string('status')->default('draft'); // draft, pending, paid, failed, cancelled
            $table->date('billing_period_start');
            $table->date('billing_period_end');
            $table->unsignedBigInteger('credits_purchased')->default(0);
            $table->text('notes')->nullable();
            $table->json('line_items')->nullable();
            $table->timestamp('sent_at')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamp('failed_at')->nullable();
            $table->timestamps();

            $table->index(['status']);
            $table->index('created_at');
            $table->index('stripe_invoice_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('invoices');
    }
};
