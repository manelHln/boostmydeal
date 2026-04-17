<?php

namespace App\Enums;

enum WorkflowTriggerType: string
{
    case PHONE_CALL_CONNECTED = 'phone_call_connected';
    case TRANSCRIPT_COMPLETE = 'transcript_complete';
    case CALL_SUMMARY = 'call_summary';
    case PHONE_CALL_ENDED = 'phone_call_ended';
    case LIVE_TRANSCRIPT = 'live_transcript';
    case MANUAL = 'manual';
}
