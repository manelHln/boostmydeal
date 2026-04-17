<?php

namespace App\Data\Api\V1;

use App\Enums\ApiKeyStatus;
use Spatie\LaravelData\Attributes\Validation\Max;
use Spatie\LaravelData\Attributes\Validation\Required;
use Spatie\LaravelData\Data;
use Spatie\LaravelData\Optional;

class ApiKeyData extends Data
{
    public function __construct(
        #[Required, Max(255)]
        public string $name,

        public Optional|string $description,

        public Optional|string $status,

        public Optional|string $key,
    ) {
        // Cast status to enum
        if ($this->status !== null) {
            $this->status = ApiKeyStatus::from($this->status)->value;
        }
    }
}
