<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Resources\Api\V1\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Auth;
use Spatie\QueryBuilder\AllowedFilter;
use Spatie\QueryBuilder\AllowedSort;
use Spatie\QueryBuilder\QueryBuilder;

/**
 * @authenticated
 * @group Users
 */
class UserController extends Controller
{
    /**
     * List all users in tenant
     *
     * @authenticated
     * @queryParam filter[name] string optional Filter by name (matches first_name or last_name)
     * @queryParam filter[email] string optional Filter by email (partial match)
     * @queryParam sort string optional Sort by field (first_name, email, created_at)
     * @response {"data": [{"id": 1, "first_name": "John", "last_name": "Doe", "email": "john@example.com"}], "meta": {...}}
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $users = QueryBuilder::for(User::class)
            ->allowedFilters(
                AllowedFilter::callback('name', function ($query, $value) {
                    $query->where(function ($query) use ($value) {
                        $query->where('first_name', 'like', "%{$value}%")
                            ->orWhere('last_name', 'like', "%{$value}%");
                    });
                }),
                AllowedFilter::partial('email'),
            )
            ->allowedSorts(
                'first_name',
                'email',
                'created_at',
            )
            ->defaultSort('first_name')
            ->paginate();

        return UserResource::collection($users);
    }

    /**
     * Get a specific user
     *
     * @authenticated
     * @urlParam user int required The ID of the user
     * @response {"id": 1, "first_name": "John", "last_name": "Doe", "email": "john@example.com", "roles": [...]}
     */
    public function show(Request $request, User $user): UserResource
    {
        return new UserResource($user);
    }

    /**
     * Delete a user
     *
     * @authenticated
     * @urlParam user int required The ID of the user
     * @response 204
     * @response 403 {"error": "Cannot delete yourself"}
     * @response 403 {"error": "You do not have permission to delete users"}
     * @response 403 {"error": "Cannot delete the last owner of the tenant"}
     */
    public function destroy(User $user): JsonResponse
    {
        $currentUser = Auth::user();

        if ($currentUser->id === $user->id) {
            return response()->json([
                'error' => 'Cannot delete yourself',
            ], 403);
        }

        if (! $currentUser->hasAnyRole(['Owner', 'Admin'])) {
            return response()->json([
                'error' => 'You do not have permission to delete users',
            ], 403);
        }

        if ($user->hasRole('Owner')) {
            $ownerCount = User::role('Owner')->count();
            if ($ownerCount <= 1) {
                return response()->json([
                    'error' => 'Cannot delete the last owner of the tenant',
                ], 403);
            }
        }

        $user->delete();

        return response()->json(null, 204);
    }
}
