<?php

namespace App\Data\Api\V1;

use Spatie\LaravelData\Data;

class CreatePaymentIntentData extends Data
{
    public function __construct(
        public readonly int $amount,
        public readonly int $credits_amount,
        public readonly string $currency = 'usd',
        public readonly ?string $description = null,
    ) {}
}
