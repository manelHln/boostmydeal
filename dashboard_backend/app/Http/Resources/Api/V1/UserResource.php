<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Resources\JsonApi\JsonApiResource;

class UserResource extends JsonApiResource
{
    public $attributes = [
        'first_name',
        'last_name',
        'email',
        'created_at',
        'updated_at',
    ];

    public $relationships = [
        'roles',
    ];
}
