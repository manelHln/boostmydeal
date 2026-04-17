<?php

namespace App\Data\Api\V1;

use Spatie\LaravelData\Data;
use Spatie\LaravelData\Optional;

class NotificationData extends Data
{
    public function __construct(
        public Optional|string $title,
        public Optional|string $body,
        public Optional|string $notification_type,
        public Optional|\DateTimeInterface $read_at,
    ) {}
}
