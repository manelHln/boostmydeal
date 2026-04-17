<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Resources\Api\V1\TenantResource;
use App\Http\Resources\Api\V1\UserResource;
use App\Interfaces\AuthServiceInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rules\Password;

/**
 * @authenticated
 * @group Authentication
 */
class AuthController extends Controller
{
    public function __construct(protected AuthServiceInterface $service) {}
    /**
     * Get the authenticated user's profile
     *
     * @authenticated
     * @response {"user": {"id": 1, "first_name": "John", "last_name": "Doe", "email": "john@example.com"}, "tenant": {"id": 1, "name": "Acme Inc"}}
     */
    public function me(Request $request): JsonResponse
    {
        $user = $request->user();
        $user->load(['roles', 'permissions']);

        return response()->json([
            'user' => new UserResource($user),
            'tenant' => [
                'id' => tenant('id'),
                'name' => tenant('name'),
            ],
        ]);
    }

    /**
     * Login to a tenant
     * Final step of the authentication flow.
     * Uses the temporary login session (created after OTP verification) and the tenant identifier to authenticate the user within a tenant.
     * @unauthenticated
     * 
     * @response 200 { "accessToken": "1|laravel_sanctum_token", "tenant": { "id": "tenant_123","name": "Acme Inc" }}
     * @response 401 { "error": "Unauthorized" }
     * @response 401 { "error": "Invalid session" }
     * @response 403 { "error": "Session mismatch" }
     * @response 403 { "error": "Forbidden" }
     */
    public function login(Request $request): JsonResponse
    {
        $loginToken = $request->cookie('login_session');

        if (! $loginToken) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $session = cache()->store('central')->get("login_session_{$loginToken}");

        if (! $session) {
            return response()->json(['error' => 'Invalid session'], 401);
        }

        if ($session['agent'] !== $request->userAgent()) {
            return response()->json(['error' => 'Session mismatch'], 403);
        }

        $centralUser = \App\Models\CentralUser::where('email', $session['email'])->firstOrFail();

        $tenant = tenant();

        $belongs = $centralUser->tenants()
            ->where('tenants.id', $tenant->id)
            ->exists();

        if (! $belongs) {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        $tenantUser = \App\Models\User::where('global_id', $centralUser->global_id)->firstOrFail();

        $tokens = $this->service->generateTokens($tenantUser);

        cache()->store('central')->forget("login_session_{$loginToken}");

        return $this->sendResponseWithTokens(
            $tokens,
            [
                'tenant' => new TenantResource($tenant),
            ]
        );
    }

    /**
     * Refresh access token.
     *
     * Accept `{refreshToken: string}` from cookies.
     * @response array{data: array{accessToken: string}, status: bool}
     */
    public function refresh(Request $request): JsonResponse
    {
        $user = Auth::user();
        $request->user()->tokens()->delete();
        $tokens = $this->service->generateTokens($user);

        return $this->sendResponseWithTokens($tokens);
    }

    /**
     * Logout.
     *
     * @response array{message: string, status: bool}
     */
    public function logout(Request $request): JsonResponse
    {
        if (Auth::check()) {
            $request->user()->tokens()->delete();
        }
        $cookie = cookie()->forget('refreshToken');

        return $this
            ->successResponse(message: 'Successfully logged out.')
            ->withCookie($cookie);
    }

    private function sendResponseWithTokens(array $tokens, $body = []): JsonResponse
    {
        $rtExpireTime = config('sanctum.rt_expiration');
        $cookie = cookie('refreshToken', $tokens['refreshToken'], $rtExpireTime, '/', null, true, true, false, 'Strict');
        $access_token_expire_time = config('sanctum.expiration');
        $access_token_cookie = cookie('accessToken', $tokens['accessToken'], $access_token_expire_time, '/', null, true, true, false, 'Strict');

        return $this->successResponse(array_merge($body, [
            'accessToken' => $tokens['accessToken'],
        ]))->withCookie($cookie)->withCookie($access_token_cookie);
    }
}
