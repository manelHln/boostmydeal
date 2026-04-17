<?php

namespace App\Data\Api\V1;

use Spatie\LaravelData\Attributes\Validation\Email;
use Spatie\LaravelData\Attributes\Validation\Max;
use Spatie\LaravelData\Attributes\Validation\Min;
use Spatie\LaravelData\Attributes\Validation\Regex;
use Spatie\LaravelData\Attributes\Validation\Required;
use Spatie\LaravelData\Attributes\Validation\Unique;
use Spatie\LaravelData\Data;

class RegisterTenantData extends Data
{
    public function __construct(
        #[Required, Max(255)]
        public string $name,

        #[Required, Max(255), Regex('/^[a-z0-9-]+$/'), Unique('tenants', 'slug')]
        public string $slug,

        #[Required, Max(255), Email]
        public string $email,

        #[Required, Min(3)]
        public string $first_name,

        #[Required, Min(3)]
        public string $last_name,

        #[Max(255)]
        public ?string $website,

        #[Max(20)]
        public ?string $phone,
    ) {}
}
