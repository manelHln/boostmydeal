<?php

namespace App\Data\Api\V1;

use Spatie\LaravelData\Attributes\Validation\Email;
use Spatie\LaravelData\Attributes\Validation\In;
use Spatie\LaravelData\Attributes\Validation\Required;
use Spatie\LaravelData\Data;

class InviteUserData extends Data
{
    public function __construct(
        #[Required, Email]
        public string $email,

        #[Required, In(['Owner', 'Admin', 'Member'])]
        public string $role,

        public ?string $name,
    ) {}
}
