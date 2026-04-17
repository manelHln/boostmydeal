<?php

namespace App\Actions;

use App\Interfaces\GeneratorInterface;
use App\Models\CentralUser;
use App\Notifications\OneTimePassword;
use Illuminate\Support\Facades\Cache;

class SendLoginOtpAction
{
    public function __construct(protected GeneratorInterface $generator) {}

    public function execute(string $email): void
    {
        $user = CentralUser::where('email', $email)->first();

        $otp = $this->generator->generate();

        Cache::store('central')->put("login_otp_{$email}", [
            'otp_hash' => hash('sha256', $otp),
            'attempts' => 0,
        ], now()->addMinutes(10));

        if ($user) {
            $user->notify(new OneTimePassword($otp));
        }
    }
}