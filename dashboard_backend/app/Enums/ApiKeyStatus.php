<?php

namespace App\Enums;

enum ApiKeyStatus: string
{
    case ACTIVE = 'active';
    case REVOKED = 'revoked';
    case EXPIRED = 'expired';
}
