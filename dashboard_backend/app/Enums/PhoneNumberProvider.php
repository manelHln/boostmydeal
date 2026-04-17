<?php

namespace App\Enums;

enum PhoneNumberProvider: string
{
    case VOXSUN = 'voxsun';
    case TWILIO = 'twilio';
}
