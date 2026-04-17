<?php

namespace App\Enums;

enum CallEventType: string
{
    case CALL_STARTED = 'call_started';
    case CALL_ANSWERED = 'call_answered';
    case CALL_NOT_ANSWERED = 'call_not_answered';
    case CALL_VOICEMAIL = 'call_voicemail';
    case CALL_ERROR = 'call_error';
    case LIVE_TRANSCRIPT = 'live_transcript';
    case CALL_COMPLETED = 'call_completed';
    case CALL_ABORTED = 'call_aborted';
}
