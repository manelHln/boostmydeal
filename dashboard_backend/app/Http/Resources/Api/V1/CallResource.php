<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Resources\JsonApi\JsonApiResource;

class CallResource extends JsonApiResource
{
    public $attributes = [
        'direction',
        'status',
        'from_number',
        'to_number',
        'duration_seconds',
        'cost',
        'recording_url',
        'livekit_room',
        'created_at',
        'updated_at',
    ];

    public $relationships = [
        'phoneNumber',
        'agent',
        'transcripts',
        'recordings',
        'events',
    ];
}
