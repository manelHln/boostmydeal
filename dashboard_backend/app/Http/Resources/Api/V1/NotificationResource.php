<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Resources\JsonApi\JsonApiResource;

class NotificationResource extends JsonApiResource
{
    public $attributes = [
        'title',
        'body',
        'notification_type',
        'read_at',
        'created_at',
        'updated_at',
    ];

    public $relationships = [];
}
