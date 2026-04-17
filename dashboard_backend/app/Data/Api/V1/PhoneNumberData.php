<?php

namespace App\Data\Api\V1;

use App\Enums\PhoneNumberProvider;
use Illuminate\Validation\Rules\Enum;
use Spatie\LaravelData\Attributes\Validation\In;
use Spatie\LaravelData\Attributes\Validation\Max;
use Spatie\LaravelData\Attributes\Validation\Required;
use Spatie\LaravelData\Attributes\Validation\Rule;
use Spatie\LaravelData\Data;

class PhoneNumberData extends Data
{
    public function __construct(
        #[Required, Max(255)]
        public string $did,

        #[Required, Max(10)]
        public string $country_code,

        #[Required, Rule(new Enum(PhoneNumberProvider::class))]
        public string $provider,

        #[Required]
        public array $provider_config,
    ) {
        // Cast provider to enum
        $this->provider = PhoneNumberProvider::from($provider)->value;
    }
}
