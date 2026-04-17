<?php

namespace App\Data\Api\V1;

use App\Enums\CallDirection;
use App\Enums\CallStatus;
use Spatie\LaravelData\Attributes\Validation\Numeric;
use Spatie\LaravelData\Attributes\Validation\Required;
use Spatie\LaravelData\Attributes\Validation\Url;
use Spatie\LaravelData\Data;
use Spatie\LaravelData\Optional;

class CallData extends Data
{
    public function __construct(
        #[Required]
        public string $phone_number_id,

        #[Required]
        public string $agent_id,

        #[Required]
        public string $direction,

        public string $status,

        #[Required]
        public string $from_number,

        #[Required]
        public string $to_number,

        #[Numeric]
        public Optional|int $duration_seconds,

        #[Numeric]
        public Optional|int $cost,

        #[Url]
        public Optional|string $recording_url,

        public Optional|string $livekit_room,
    ) {
        $this->direction = CallDirection::from($direction)->value;
        if ($status) {
            $this->status = CallStatus::from($status)->value;
        }
    }
}
