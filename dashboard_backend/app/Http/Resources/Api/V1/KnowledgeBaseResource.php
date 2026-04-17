<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Resources\JsonApi\JsonApiResource;

class KnowledgeBaseResource extends JsonApiResource
{
    public $attributes = [
        'name',
        'description',
        'document_url',
        'document_type',
        'created_at',
        'updated_at',
    ];

    public $relationships = [
        'agents',
    ];
}
