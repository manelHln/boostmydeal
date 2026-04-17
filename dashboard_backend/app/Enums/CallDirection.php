<?php

namespace App\Enums;

enum CallDirection: string
{
    case INBOUND = 'inbound';
    case OUTBOUND = 'outbound';
}
