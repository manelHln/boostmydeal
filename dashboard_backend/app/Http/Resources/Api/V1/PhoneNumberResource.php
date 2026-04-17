<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Resources\JsonApi\JsonApiResource;

class PhoneNumberResource extends JsonApiResource
{
    public $attributes = [
        'did',
        'country_code',
        'provider',
        'created_at',
        'updated_at',
    ];

    public $relationships = [
        'agents',
    ];
}
