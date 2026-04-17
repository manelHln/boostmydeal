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
        Schema::create('calls_transcripts', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('call_id')->constrained('calls')->cascadeOnDelete();
            $table->string('speaker')->nullable(false);
            $table->text('content')->nullable(false);
            $table->integer('timestamp_ms')->nullable(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('calls_transcripts');
    }
};
