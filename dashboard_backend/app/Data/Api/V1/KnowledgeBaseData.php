<?php

namespace App\Data\Api\V1;

use Spatie\LaravelData\Attributes\Validation\Max;
use Spatie\LaravelData\Attributes\Validation\Required;
use Spatie\LaravelData\Attributes\Validation\Url;
use Spatie\LaravelData\Data;
use Spatie\LaravelData\Optional;

class KnowledgeBaseData extends Data
{
    public function __construct(
        #[Required, Max(255)]
        public string $name,

        public Optional|string $description,

        #[Url, Max(255)]
        public Optional|string $document_url,

        #[Required, Max(100)]
        public string $document_type,
    ) {}
}
