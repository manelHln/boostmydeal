<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Resources\JsonApi\JsonApiResource;

class TenantInvitationResource extends JsonApiResource
{
    public $attributes = [
        'email',
        'name',
        'role',
        'expires_at',
        'accepted_at',
        'created_at',
    ];

    public $relationships = [
        'invitedBy',
    ];
}
