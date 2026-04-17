<?php

namespace App\Http\Controllers\Api\V1;

use App\Data\Api\V1\ApiKeyData;
use App\Enums\ApiKeyStatus;
use App\Http\Resources\Api\V1\ApiKeyResource;
use App\Models\ApiKey;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Str;
use Spatie\QueryBuilder\AllowedFilter;
use Spatie\QueryBuilder\QueryBuilder;

/**
 * @authenticated
 * @group API Keys
 */
class ApiKeyController extends Controller
{
    /**
     * List all API keys
     *
     * @authenticated
     * @queryParam filter[name] string optional Filter by name (partial match)
     * @queryParam filter[status] string optional Filter by status
     * @queryParam sort string optional Sort by field (name, created_at, updated_at)
     * @response {"data": [{"id": 1, "name": "My App", "status": "active"}], "meta": {...}}
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $apiKeys = QueryBuilder::for(ApiKey::class)
            ->allowedFilters(
                AllowedFilter::partial('name'),
                AllowedFilter::exact('status'),
            )
            ->allowedSorts(
                'name',
                'created_at',
                'updated_at',
            )
            ->defaultSort('-created_at')
            ->paginate();

        return ApiKeyResource::collection($apiKeys);
    }

    /**
     * Create a new API key
     *
     * @authenticated
     * @bodyParam name string required API key name
     * @bodyParam key string optional API key value (auto-generated if not provided)
     * @bodyParam status string optional Key status (default: active)
     * @response {"id": 1, "name": "My App", "status": "active", "last_used_at": null}
     */
    public function store(ApiKeyData $data): ApiKeyResource
    {
        $apiKeyData = $data->toArray();
        $apiKeyData['key_hash'] = hash('sha256', $apiKeyData['key'] ?? Str::random(40));
        $apiKeyData['status'] = ApiKeyStatus::ACTIVE->value;

        $apiKey = ApiKey::create($apiKeyData);

        return new ApiKeyResource($apiKey);
    }

    /**
     * Get a specific API key
     *
     * @authenticated
     * @urlParam apiKey int required The ID of the API key
     * @response {"id": 1, "name": "My App", "status": "active", "last_used_at": null}
     */
    public function show(Request $request, ApiKey $apiKey): ApiKeyResource
    {
        $apiKey = QueryBuilder::for($apiKey)->first();

        return new ApiKeyResource($apiKey);
    }

    /**
     * Update an API key
     *
     * @authenticated
     * @urlParam apiKey int required The ID of the API key
     * @bodyParam name string optional API key name
     * @bodyParam status string optional Key status
     * @response {"id": 1, "name": "Updated App", "status": "active"}
     */
    public function update(ApiKeyData $data, ApiKey $apiKey): ApiKeyResource
    {
        $apiKey->update($data->toArray());

        return new ApiKeyResource($apiKey->fresh());
    }

    /**
     * Delete an API key
     *
     * @authenticated
     * @urlParam apiKey int required The ID of the API key
     * @response 204
     */
    public function destroy(ApiKey $apiKey): JsonResponse
    {
        $apiKey->delete();

        return response()->json(null, 204);
    }

    /**
     * Revoke an API key
     *
     * @authenticated
     * @urlParam apiKey int required The ID of the API key
     * @response {"message": "API key revoked successfully"}
     */
    public function revoke(ApiKey $apiKey): JsonResponse
    {
        $apiKey->update(['status' => ApiKeyStatus::REVOKED->value]);

        return response()->json(['message' => 'API key revoked successfully']);
    }
}
