<?php

use App\Enums\AgentVoiceAIMode;
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
        Schema::create('agents', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->string('description')->nullable();
            $table->string('language')->nullable(false)->default('en');
            $table->string('mode')->nullable(false)->default(AgentVoiceAIMode::PIPELINE->value);
            $table->string('llm_provider')->nullable();
            $table->string('llm_model')->nullable();
            $table->string('stt_provider')->nullable();
            $table->string('stt_model')->nullable();
            $table->string('tts_provider')->nullable();
            $table->string('tts_voice')->nullable();
            $table->string('realtime_provider')->nullable();
            $table->string('first_message')->nullable();
            $table->boolean('user_speaks_first')->nullable(false)->default(false);
            $table->longText('identity')->nullable();
            $table->longText('style')->nullable();
            $table->longText('goal')->nullable();
            $table->longText('voicemail_message')->nullable();
            $table->longText('response_guideline')->nullable();
            $table->longText('fallback')->nullable();
            $table->float('temperature')->default(0.8);
            $table->boolean('call_recording')->default(true);
            $table->string('recording_format')->default('mp3');
            $table->boolean('remember_lead_preference')->default(false);
            $table->boolean('enable_human_transfer')->default(false);
            $table->boolean('enable_background_sound')->default(false);
            $table->boolean('background_sound')->default(false);
            $table->boolean('enable_interruptions')->default(true);
            $table->boolean('enable_vad')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('agents');
    }
};
