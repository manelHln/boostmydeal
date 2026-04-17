<?php

namespace App\Data\Api\V1;

use App\Enums\AgentVoiceAIMode;
use Spatie\LaravelData\Attributes\Validation\Max;
use Spatie\LaravelData\Attributes\Validation\Numeric;
use Spatie\LaravelData\Attributes\Validation\Required;
use Spatie\LaravelData\Data;
use Spatie\LaravelData\Optional;

class AgentData extends Data
{
    public function __construct(
        #[Required, Max(255)]
        public string $name,

        public Optional|string $description,

        #[Required, Max(10)]
        public string $language,

        public string $mode,

        public Optional|string $llm_provider,
        public Optional|string $llm_model,
        public Optional|string $stt_provider,
        public Optional|string $stt_model,
        public Optional|string $tts_provider,
        public Optional|string $tts_voice,
        public Optional|string $realtime_provider,
        public Optional|string $first_message,
        public bool $user_speaks_first,
        public Optional|string $identity,
        public Optional|string $style,
        public Optional|string $goal,
        public Optional|string $voicemail_message,
        public Optional|string $response_guideline,
        public Optional|string $fallback,
        #[Numeric, Max(2)]
        public Optional|float $temperature,
        public bool $call_recording,
        public Optional|string $recording_format,
        public bool $remember_lead_preference,
        public bool $enable_human_transfer,
        public bool $enable_background_sound,
        public Optional|bool $background_sound,
        public bool $enable_interruptions = true,
        public bool $enable_vad = true,
        public Optional|string $phone_number_id,
    ) {
        // Cast mode to enum
        $this->mode = AgentVoiceAIMode::from($mode)->value;
    }
}
