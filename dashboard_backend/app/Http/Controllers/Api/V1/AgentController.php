<?php

namespace App\Http\Controllers\Api\V1;

use App\Data\Api\V1\AgentData;
use App\Http\Resources\Api\V1\AgentResource;
use App\Models\Agent;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Spatie\QueryBuilder\AllowedFilter;
use Spatie\QueryBuilder\QueryBuilder;

/**
 * @authenticated
 * @group Agents
 */
class AgentController extends Controller
{
    /**
     * List all agents
     *
     * @authenticated
     * @queryParam name string Filter by agent name (partial match)
     * @queryParam mode string Filter by agent mode
     * @queryParam sort string Sort by field (name, created_at, updated_at)
     * @queryParam filter[phoneNumbers] string Include phone numbers in response
     * @queryParam filter[knowledgeBases] string Include knowledge bases in response
     * @response {"data": [{"id": 1, "name": "Sales Agent", "mode": "voice"}], "meta": {...}}
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $agents = QueryBuilder::for(Agent::class)
            ->allowedFilters(
                AllowedFilter::partial('name'),
                AllowedFilter::exact('mode'),
            )
            ->allowedSorts(
                'name',
                'created_at',
                'updated_at',
            )
            ->defaultSort('-created_at')
            ->allowedIncludes('phoneNumbers', 'knowledgeBases')
            ->paginate();

        return AgentResource::collection($agents);
    }

    /**
     * Create a new agent
     *
     * @authenticated
     * @bodyParam name string required Agent name
     * @bodyParam description string optional Agent description
     * @bodyParam language string required Agent language code
     * @bodyParam mode string optional Agent mode
     * @response {"id": 1, "name": "New Agent", "language": "en"}
     */
    public function store(AgentData $data): AgentResource
    {
        $agent = Agent::create($data->toArray());

        return new AgentResource($agent);
    }

    /**
     * Get a specific agent
     *
     * @authenticated
     * @urlParam agent int required The ID of the agent
     * @queryParam filter[phoneNumbers] string Include phone numbers in response
     * @queryParam filter[knowledgeBases] string Include knowledge bases in response
     * @response {"id": 1, "name": "Sales Agent", "language": "en"}
     */
    public function show(Request $request, Agent $agent): AgentResource
    {
        $agent = QueryBuilder::for($agent)
            ->allowedIncludes('phoneNumbers', 'knowledgeBases')
            ->first();

        return new AgentResource($agent);
    }

    /**
     * Update an agent
     *
     * @authenticated
     * @bodyParam name string optional Agent name
     * @bodyParam description string optional Agent description
     * @bodyParam language string optional Agent language code
     * @bodyParam mode string optional Agent mode
     * @response {"id": 1, "name": "Updated Agent", "language": "en"}
     */
    public function update(AgentData $data, Agent $agent): AgentResource
    {
        $agent->update($data->toArray());

        return new AgentResource($agent->fresh());
    }

    /**
     * Delete an agent
     *
     * @authenticated
     * @response 204
     */
    public function destroy(Agent $agent): JsonResponse
    {
        $agent->delete();

        return response()->json(null, 204);
    }
}
