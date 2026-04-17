<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Resources\JsonApi\JsonApiResource;

class TenantResource extends JsonApiResource
{
    public $attributes = [
        'id',
        'name',
        'slug',
        'status',
        'website',
        'phone',
        'created_at',
        'updated_at',
    ];
}
