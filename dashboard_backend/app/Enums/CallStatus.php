<?php

namespace App\Enums;

enum CallStatus: string
{
    case INITIATED = 'initiated';
    case IN_PROGRESS = 'in_progress';
    case COMPLETED = 'completed';
    case CANCELLED = 'cancelled';
    case MISSED = 'missed';
    case ANSWERED = 'answered';
    case UNKNOWN = 'unknown';
    case FAILED = 'failed';
}
