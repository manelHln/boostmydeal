<?php

namespace App\Enums;

enum AgentVoiceAIMode: string
{
    case PIPELINE = 'pipeline';
    case REALTIME = 'realtime';
}
