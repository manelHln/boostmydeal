<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Resources\JsonApi\JsonApiResource;

class ApiKeyResource extends JsonApiResource
{
    public $attributes = [
        'name',
        'description',
        'status',
        'last_used_at',
        'created_at',
        'updated_at',
    ];

    public $relationships = [];
}
