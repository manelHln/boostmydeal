<?php

namespace App\Http\Controllers\Api\V1;

use App\Data\Api\V1\KnowledgeBaseData;
use App\Http\Resources\Api\V1\KnowledgeBaseResource;
use App\Models\KnowledgeBase;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Spatie\QueryBuilder\AllowedFilter;
use Spatie\QueryBuilder\QueryBuilder;

/**
 * @authenticated
 * @group Knowledge Bases
 */
class KnowledgeBaseController extends Controller
{
    /**
     * List all knowledge bases
     *
     * @authenticated
     * @queryParam filter[name] string optional Filter by name (partial match)
     * @queryParam filter[document_type] string optional Filter by document type
     * @queryParam sort string optional Sort by field (name, created_at, updated_at)
     * @queryParam filter[agents] string optional Include agents in response
     * @response {"data": [{"id": 1, "name": "Product FAQ", "document_type": "pdf"}], "meta": {...}}
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $knowledgeBases = QueryBuilder::for(KnowledgeBase::class)
            ->allowedFilters(
                AllowedFilter::partial('name'),
                AllowedFilter::exact('document_type'),
            )
            ->allowedSorts(
                'name',
                'created_at',
                'updated_at',
            )
            ->defaultSort('-created_at')
            ->allowedIncludes('agents')
            ->paginate();

        return KnowledgeBaseResource::collection($knowledgeBases);
    }

    /**
     * Create a new knowledge base
     *
     * @authenticated
     * @bodyParam name string required Knowledge base name
     * @bodyParam description string optional Knowledge base description
     * @bodyParam document_type string optional Document type
     * @response {"id": 1, "name": "Product FAQ", "document_type": "pdf"}
     */
    public function store(KnowledgeBaseData $data): KnowledgeBaseResource
    {
        $knowledgeBase = KnowledgeBase::create($data->toArray());

        return new KnowledgeBaseResource($knowledgeBase);
    }

    /**
     * Get a specific knowledge base
     *
     * @authenticated
     * @urlParam knowledgeBase int required The ID of the knowledge base
     * @queryParam filter[agents] string optional Include agents in response
     * @response {"id": 1, "name": "Product FAQ", "document_type": "pdf", "agents": [...]}
     */
    public function show(Request $request, KnowledgeBase $knowledgeBase): KnowledgeBaseResource
    {
        $knowledgeBase = QueryBuilder::for($knowledgeBase)
            ->allowedIncludes('agents')
            ->first();

        return new KnowledgeBaseResource($knowledgeBase);
    }

    /**
     * Update a knowledge base
     *
     * @authenticated
     * @urlParam knowledgeBase int required The ID of the knowledge base
     * @bodyParam name string optional Knowledge base name
     * @bodyParam description string optional Knowledge base description
     * @bodyParam document_type string optional Document type
     * @response {"id": 1, "name": "Updated FAQ", "document_type": "pdf"}
     */
    public function update(KnowledgeBaseData $data, KnowledgeBase $knowledgeBase): KnowledgeBaseResource
    {
        $knowledgeBase->update($data->toArray());

        return new KnowledgeBaseResource($knowledgeBase->fresh());
    }

    /**
     * Delete a knowledge base
     *
     * @authenticated
     * @urlParam knowledgeBase int required The ID of the knowledge base
     * @response 204
     */
    public function destroy(KnowledgeBase $knowledgeBase): JsonResponse
    {
        $knowledgeBase->delete();

        return response()->json(null, 204);
    }
}
