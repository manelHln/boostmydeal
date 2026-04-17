<?php

namespace App\Providers;

use App\Enums\TokenAbility;
use App\Models\PersonalAccessToken;
use Illuminate\Support\ServiceProvider;
use Laravel\Sanctum\Sanctum;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        /**
         * By default, Sanctum does not differentiate between accessToken and refreshToken.
         * It simply takes the bearer token from the Authorizationheader and compares it with what is stored in the database.
         * Therefore, we need to specify that if a request is made to refresh the token,
         * it should check the refreshToken rather than the accessToken.
         */
        $this->overrideSanctumConfigurationToSupportRefreshToken();

        $this->app->bind(
            \App\Interfaces\GeneratorInterface::class,
            \App\Services\NumberGenerator::class,
        );
        $this->app->bind(
            \App\Interfaces\AuthServiceInterface::class,
            \App\Services\AuthService::class,
        );
    }

    private function overrideSanctumConfigurationToSupportRefreshToken(): void
    {
        Sanctum::$accessTokenAuthenticationCallback = function ($accessToken, $isValid) {
            $abilities = collect($accessToken->abilities);
            if (!empty($abilities) && $abilities[0] === TokenAbility::ISSUE_ACCESS_TOKEN->value) {
                return $accessToken->expires_at && $accessToken->expires_at->isFuture();
            }

            return $isValid;
        };

        Sanctum::$accessTokenRetrievalCallback = function ($request) {
            if (!$request->routeIs('refresh')) {
                return str_replace('Bearer ', '', $request->headers->get('Authorization'));
            }

            return $request->cookie('refreshToken') ?? '';
        };
    }
}
