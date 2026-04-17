<?php

namespace App\Data\Api\V1;

use Spatie\LaravelData\Attributes\Validation\Required;
use Spatie\LaravelData\Data;

class InitiateCallData extends Data
{
    public function __construct(
        #[Required]
        public string $agent_id,

        #[Required]
        public string $contact_name,

        #[Required]
        public string $to_number,
    ) {
        
    }
}
