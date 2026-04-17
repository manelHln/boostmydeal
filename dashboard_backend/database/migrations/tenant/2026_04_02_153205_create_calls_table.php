<?php

use App\Enums\CallStatus;
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
        Schema::create('calls', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('phone_number_id')->constrained('phone_numbers')->cascadeOnDelete();
            $table->foreignUuid('agent_id')->constrained('agents')->cascadeOnDelete();
            $table->string('direction')->nullable(false);
            $table->string('status')->nullable(false)->default(CallStatus::UNKNOWN->value);
            $table->string('from_number')->nullable(false);
            $table->string('to_number')->nullable(false);
            $table->integer('duration_seconds')->default(0);
            $table->unsignedBigInteger('cost')->default(0);
            $table->string('recording_url')->nullable();
            $table->string('livekit_room')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('calls');
    }
};
