<?php

namespace App\Http\Controllers\Api\V1;

use App\Data\Api\V1\InviteUserData;
use App\Http\Resources\Api\V1\TenantInvitationResource;
use App\Models\TenantInvitation;
use App\Models\User;
use App\Notifications\TenantInvitationNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Str;
use Spatie\QueryBuilder\AllowedFilter;
use Spatie\QueryBuilder\QueryBuilder;

/**
 * @authenticated
 * @group Tenant Invitations
 */
class TenantInvitationController extends Controller
{
    /**
     * List all tenant invitations
     *
     * @authenticated
     * @queryParam filter[email] string optional Filter by email (partial match)
     * @queryParam filter[role] string optional Filter by role
     * @queryParam sort string optional Sort by field (created_at, expires_at)
     * @response {"data": [{"id": 1, "email": "invited@example.com", "role": "admin", "expires_at": "2024-02-01"}], "meta": {...}}
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $invitations = QueryBuilder::for(TenantInvitation::class)
            ->whereNull('accepted_at')
            ->where('expires_at', '>', now())
            ->allowedFilters(
                AllowedFilter::partial('email'),
                AllowedFilter::exact('role'),
            )
            ->allowedSorts(
                'created_at',
                'expires_at',
            )
            ->defaultSort('-created_at')
            ->paginate();

        return TenantInvitationResource::collection($invitations);
    }

    /**
     * Create a new tenant invitation
     *
     * @authenticated
     * @bodyParam email string required Email to invite
     * @bodyParam name string optional Display name for the invitee
     * @bodyParam role string optional Role to assign (default: member)
     * @response {"id": 1, "email": "invited@example.com", "role": "admin", "expires_at": "2024-02-01"}
     */
    public function store(InviteUserData $data): TenantInvitationResource|JsonResponse
    {
        $currentUser = Auth::user();

        if (! $currentUser->hasAnyRole(['Owner', 'Admin'])) {
            return response()->json([
                'error' => 'You do not have permission to invite users',
            ], 403);
        }

        $existingUser = User::where('email', $data->email)->first();
        if ($existingUser) {
            return response()->json([
                'error' => 'User with this email already exists in this tenant',
            ], 422);
        }

        $pendingInvitation = TenantInvitation::where('email', $data->email)
            ->whereNull('accepted_at')
            ->where('expires_at', '>', now())
            ->first();

        if ($pendingInvitation) {
            return response()->json([
                'error' => 'User already has a pending invitation',
            ], 422);
        }

        $invitation = TenantInvitation::create([
            'email' => $data->email,
            'name' => $data->name,
            'role' => $data->role,
            'invited_by' => $currentUser->id,
            'token' => Str::random(64),
            'expires_at' => now()->addDays(7),
        ]);

        Notification::route('mail', $data->email)->notify(
            new TenantInvitationNotification($invitation)
        );

        return new TenantInvitationResource($invitation);
    }

    /**
     * Get a specific tenant invitation
     *
     * @authenticated
     * @urlParam invitation int required The ID of the invitation
     * @response {"id": 1, "email": "invited@example.com", "role": "admin", "accepted_at": null}
     */
    public function show(Request $request, TenantInvitation $invitation): TenantInvitationResource
    {
        return new TenantInvitationResource($invitation);
    }

    /**
     * Accept a tenant invitation
     *
     * @authenticated
     * @urlParam invitation int required The ID of the invitation
     * @response {"message": "Invitation accepted successfully", "role": "admin"}
     * @response 422 {"error": "Invitation is expired or already accepted"}
     */
    public function accept(Request $request, TenantInvitation $invitation): JsonResponse
    {
        if ($invitation->isExpired() || $invitation->isAccepted()) {
            return response()->json([
                'error' => 'Invitation is expired or already accepted',
            ], 422);
        }

        $currentUser = Auth::user();

        $invitation->update(['accepted_at' => now()]);

        $currentUser->assignRole($invitation->role);

        return response()->json([
            'message' => 'Invitation accepted successfully',
            'role' => $invitation->role,
        ]);
    }

    /**
     * Reject a tenant invitation
     *
     * @authenticated
     * @urlParam invitation int required The ID of the invitation
     * @response 204
     */
    public function reject(TenantInvitation $invitation): JsonResponse
    {
        $invitation->delete();

        return response()->json(null, 204);
    }

    /**
     * Cancel a tenant invitation
     *
     * @authenticated
     * @urlParam invitation int required The ID of the invitation
     * @response 204
     * @response 403 {"error": "You do not have permission to cancel invitations"}
     */
    public function destroy(TenantInvitation $invitation): JsonResponse
    {
        $currentUser = Auth::user();

        if (! $currentUser->hasAnyRole(['Owner', 'Admin'])) {
            return response()->json([
                'error' => 'You do not have permission to cancel invitations',
            ], 403);
        }

        $invitation->delete();

        return response()->json(null, 204);
    }
}
