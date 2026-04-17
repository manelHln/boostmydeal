<?php

namespace App\Interfaces;

interface AuthServiceInterface
{
    public function generateTokens($user): array;
}