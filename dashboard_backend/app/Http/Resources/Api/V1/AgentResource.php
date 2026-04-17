<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Resources\JsonApi\JsonApiResource;

class AgentResource extends JsonApiResource
{
    public $attributes = [
        'name',
        'description',
        'language',
        'mode',
        'llm_provider',
        'llm_model',
        'stt_provider',
        'stt_model',
        'tts_provider',
        'tts_voice',
        'realtime_provider',
        'first_message',
        'user_speaks_first',
        'identity',
        'style',
        'goal',
        'voicemail_message',
        'response_guideline',
        'fallback',
        'temperature',
        'call_recording',
        'recording_format',
        'remember_lead_preference',
        'enable_human_transfer',
        'enable_background_sound',
        'background_sound',
        'enable_interruptions',
        'enable_vad',
        'created_at',
        'updated_at',
    ];

    public $relationships = [
        'phoneNumbers',
        'knowledgeBases',
    ];
}
