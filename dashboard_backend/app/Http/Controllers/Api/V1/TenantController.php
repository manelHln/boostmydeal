<?php

namespace App\Http\Controllers\Api\V1;

use App\Actions\RegisterTenantAction;
use App\Actions\SendLoginOtpAction;
use App\Data\Api\V1\RegisterTenantData;
use App\Http\Resources\Api\V1\TenantResource;
use App\Models\CentralUser;
use App\Models\Tenant;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Str;

/**
 * @group Tenants
 */
class TenantController extends Controller
{
    /**
     * Register a new tenant
     *
     * @unauthenticated
     * @bodyParam name string required Tenant name
     * @bodyParam email string required Email address
     * @bodyParam password string required Password
     * @response {"id": 1, "name": "Acme Inc", "slug": "acme-inc", "email": "admin@acme.com"}
     */
    public function store(RegisterTenantData $data, RegisterTenantAction $action): JsonResponse|TenantResource
    {
        try {
            $result = $action->execute($data);

            return new TenantResource($result);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to register tenant: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get tenant details
     *
     * @authenticated
     * @urlParam tenant int required The ID of the tenant
     * @response {"id": 1, "name": "Acme Inc", "slug": "acme-inc", "email": "admin@acme.com"}
     */
    public function show(Tenant $tenant): TenantResource
    {
        return new TenantResource($tenant);
    }

    /**
     * Update tenant information
     *
     * @authenticated
     * @urlParam tenant int required The ID of the tenant
     * @bodyParam name string optional Tenant name
     * @bodyParam slug string optional Tenant slug (unique)
     * @bodyParam website string optional Website URL
     * @bodyParam phone string optional Phone number
     * @bodyParam status string optional Tenant status (active, inactive)
     * @response {"id": 1, "name": "Acme Inc", "slug": "acme-inc"}
     * @response 403 {"error": "You do not have permission to update tenant information"}
     */
    public function update(Request $request, Tenant $tenant): JsonResponse|TenantResource
    {
        $currentUser = auth()->user();

        if (! $currentUser->hasRole('Owner')) {
            return response()->json([
                'error' => 'You do not have permission to update tenant information',
            ], 403);
        }

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'slug' => 'sometimes|string|max:255|regex:/^[a-z0-9-]+$/|unique:tenants,slug,' . $tenant->id,
            'website' => 'sometimes|nullable|string|max:255|url',
            'phone' => 'sometimes|nullable|string|max:20',
            'status' => 'sometimes|in:active,inactive',
        ]);

        $tenant->update($validated);

        return new TenantResource($tenant);
    }

    /**
     * Delete a tenant
     *
     * @authenticated
     * @urlParam tenant int required The ID of the tenant
     * @response 204
     * @response 403 {"error": "You do not have permission to delete this tenant"}
     */
    public function destroy(Tenant $tenant): JsonResponse
    {
        $currentUser = auth()->user();

        if (! $currentUser->hasRole('Owner')) {
            return response()->json([
                'error' => 'You do not have permission to delete this tenant',
            ], 403);
        }

        $tenant->delete();

        return response()->json(null, 204);
    }

    /**
     * Check email and send OTP
     *
     * @unauthenticated
     * @bodyParam email string required Email address
     * @response 204
     * @response 404 {"error": "User not found"}
     */
    public function checkEmail(Request $request, SendLoginOtpAction $sendLoginOtpAction): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        $email = $request->input('email');

        $sendLoginOtpAction->execute($email);

        return response()->json(null, 204);
    }

    /**
     * Verify OTP and return user's tenants
     *
     * @unauthenticated
     * @bodyParam email string required Email address
     * @bodyParam otp string required OTP code
     * @response {"tenants": [{"id": "abc", "name": "Acme Inc", "slug": "acme-inc"}]}
     * @response 401 {"error": "Invalid or expired OTP"}
     */
    public function verifyOtp(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
            'otp' => 'required|string',
        ]);

        $email = $request->email;
        $otp = $request->otp;

        $cacheKey = "login_otp_{$email}";
        $cached = cache()->store('central')->get($cacheKey);

        if (! $cached) {
            return response()->json(['error' => 'Invalid or expired OTP'], 401);
        }

        if ($cached['attempts'] >= 5) {
            cache()->store('central')->forget($cacheKey);
            return response()->json(['error' => 'Too many attempts'], 429);
        }

        if (! hash_equals($cached['otp_hash'], hash('sha256', $otp))) {
            $cached['attempts']++;
            cache()->store('central')->put($cacheKey, $cached, now()->addMinutes(10));

            return response()->json(['error' => 'Invalid or expired OTP'], 401);
        }

        cache()->store('central')->forget($cacheKey);

        $loginToken = hash('sha256', Str::random(60));

        cache()->store('central')->put("login_session_{$loginToken}", [
            'email' => $email,
            'agent' => $request->userAgent(),
        ], now()->addMinutes(10));

        $user = CentralUser::with('tenants')
            ->where('email', $email)
            ->first();

        return response()
            ->json([
                'tenants' => TenantResource::collection($user?->tenants ?? collect()),
            ])
            ->cookie(
                'login_session',
                $loginToken,
                10,
                null,
                null,
                true,
                true
            );
    }
}
