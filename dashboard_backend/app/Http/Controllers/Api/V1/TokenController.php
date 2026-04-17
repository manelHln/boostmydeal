<?php

namespace App\Http\Controllers\Api\V1;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

/**
 * @authenticated
 * @group API Tokens
 */
class TokenController extends Controller
{
    /**
     * Create a new API token
     *
     * @authenticated
     * @bodyParam name string required The token name
     * @bodyParam abilities array optional The token abilities (default: all)
     * @response {"token": "1|abc123...", "abilities": ["*"]}
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'abilities' => 'sometimes|array',
        ]);

        $user = Auth::user();
        $abilities = $request->get('abilities', ['*']);

        $token = $user->createToken($request->name, $abilities);

        return response()->json([
            'token' => $token->plainTextToken,
            'abilities' => $token->accessToken->abilities,
        ], 201);
    }

    /**
     * List all API tokens for the authenticated user
     *
     * @authenticated
     * @response {"data": [{"id": 1, "name": "My Token", "abilities": ["*"], "created_at": "2024-01-01T00:00:00Z"}]}
     */
    public function index(Request $request): JsonResponse
    {
        $tokens = $request->user()->tokens()->latest()->get();

        return response()->json([
            'data' => $tokens->map(function ($token) {
                return [
                    'id' => $token->id,
                    'name' => $token->name,
                    'abilities' => $token->abilities,
                    'last_used_at' => $token->last_used_at?->toISOString(),
                    'created_at' => $token->created_at->toISOString(),
                    'expires_at' => $token->expires_at?->toISOString(),
                ];
            }),
        ]);
    }

    /**
     * Delete an API token
     *
     * @authenticated
     * @urlParam tokenId string required The ID of the token to delete
     * @response {"message": "Token revoked successfully"}
     */
    public function destroy(Request $request, string $tokenId): JsonResponse
    {
        $token = $request->user()->tokens()->findOrFail($tokenId);
        $token->delete();

        return response()->json(['message' => 'Token revoked successfully']);
    }
}
