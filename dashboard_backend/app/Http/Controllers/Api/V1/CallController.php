<?php

namespace App\Http\Controllers\Api\V1;

use App\Actions\InitiateCallAction;
use App\Data\Api\V1\CallData;
use App\Data\Api\V1\InitiateCallData;
use App\Http\Resources\Api\V1\CallResource;
use App\Models\Call;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Response;
use Spatie\QueryBuilder\AllowedFilter;
use Spatie\QueryBuilder\QueryBuilder;

/**
 * @authenticated
 * @group Calls
 */
class CallController extends Controller
{
    /**
     * List all calls
     *
     * @authenticated
     * @queryParam filter[status] string Filter by call status
     * @queryParam filter[direction] string Filter by call direction (inbound/outbound)
     * @queryParam filter[phone_number_id] string Filter by phone number ID
     * @queryParam filter[agent_id] string Filter by agent ID
     * @queryParam filter[from_number] string Filter by from number (partial match)
     * @queryParam filter[to_number] string Filter by to number (partial match)
     * @queryParam sort string Sort by field (created_at, updated_at, duration_seconds, cost)
     * @response {"data": [{"id": 1, "status": "completed", "duration_seconds": 120}]}
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $calls = QueryBuilder::for(Call::class)
            ->allowedFilters(
                AllowedFilter::exact('status'),
                AllowedFilter::exact('direction'),
                AllowedFilter::exact('phone_number_id'),
                AllowedFilter::exact('agent_id'),
                AllowedFilter::scope('date_range'),
                AllowedFilter::partial('from_number'),
                AllowedFilter::partial('to_number'),
            )
            ->allowedSorts(
                'created_at',
                'updated_at',
                'duration_seconds',
                'cost',
            )
            ->defaultSort('-created_at')
            ->allowedIncludes(
                'phoneNumber',
                'agent',
                'transcripts',
                'recordings',
                'events',
            )
            ->paginate();

        return CallResource::collection($calls);
    }

    /**
     * Create a new call
     *
     * @authenticated
     * @bodyParam phone_number_id string required Phone number ID
     * @bodyParam agent_id string required Agent ID
     * @bodyParam direction string required Call direction (inbound/outbound)
     * @bodyParam status string required Call status
     * @response {"id": 1, "status": "completed", "duration_seconds": 120}
     */
    public function store(CallData $data): CallResource
    {
        $call = Call::create($data->toArray());

        return new CallResource($call);
    }

    /**
     * Get a specific call
     *
     * @authenticated
     * @urlParam call int required The ID of the call
     * @response {"id": 1, "status": "completed", "duration_seconds": 120}
     */
    public function show(Request $request, Call $call): CallResource
    {
        $call = QueryBuilder::for($call)
            ->allowedIncludes(
                'phoneNumber',
                'agent',
                'transcripts',
                'recordings',
                'events',
            )
            ->first();

        return new CallResource($call);
    }

    /**
     * Update a call
     *
     * @authenticated
     * @urlParam call int required The ID of the call
     * @response {"id": 1, "status": "updated", "duration_seconds": 120}
     */
    public function update(CallData $data, Call $call): CallResource
    {
        $call->update($data->toArray());

        return new CallResource($call->fresh());
    }

    /**
     * Delete a call
     *
     * @authenticated
     * @urlParam call int required The ID of the call
     * @response 204
     */
    public function destroy(Call $call): JsonResponse
    {
        $call->delete();

        return response()->json(null, 204);
    }

    /**
     * Export calls to CSV
     *
     * @authenticated
     * @queryParam start_date date optional Start date for export (default: 30 days ago)
     * @queryParam end_date date optional End date for export (default: now)
     * @queryParam filter[status] string Filter by call status
     * @queryParam filter[direction] string Filter by call direction
     * @response text/csv CSV file
     */
    public function exportCsv(Request $request)
    {
        $startDate = $request->input('start_date')
            ? Carbon::parse($request->input('start_date'))->startOfDay()
            : Carbon::now()->subDays(30)->startOfDay();

        $endDate = $request->input('end_date')
            ? Carbon::parse($request->input('end_date'))->endOfDay()
            : Carbon::now()->endOfDay();

        $calls = QueryBuilder::for(Call::class)
            ->whereBetween('created_at', [$startDate, $endDate])
            ->allowedFilters(
                AllowedFilter::exact('status'),
                AllowedFilter::exact('direction'),
                AllowedFilter::exact('phone_number_id'),
                AllowedFilter::exact('agent_id'),
                AllowedFilter::partial('from_number'),
                AllowedFilter::partial('to_number'),
            )
            ->allowedIncludes(
                'phoneNumber',
                'agent',
            )
            ->defaultSort('-created_at')
            ->get();

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="calls-export-'.now()->format('Y-m-d').'.csv"',
        ];

        $callback = function () use ($calls) {
            $file = fopen('php://output', 'w');

            // CSV Header
            fputcsv($file, [
                'ID',
                'Date',
                'Direction',
                'Status',
                'From Number',
                'To Number',
                'Duration (seconds)',
                'Cost',
                'Agent',
                'Phone Number',
            ]);

            // CSV Data
            foreach ($calls as $call) {
                fputcsv($file, [
                    $call->id,
                    $call->created_at->format('Y-m-d H:i:s'),
                    $call->direction,
                    $call->status,
                    $call->from_number,
                    $call->to_number,
                    $call->duration_seconds,
                    $call->cost,
                    $call->agent->name ?? 'N/A',
                    $call->phoneNumber->did ?? 'N/A',
                ]);
            }

            fclose($file);
        };

        return Response::stream($callback, 200, $headers);
    }

    /**
     * Get webhooks for a specific call
     *
     * @authenticated
     * @urlParam call int required The ID of the call
     * @response {"call_id": 1, "webhooks": [{"id": 1, "event_type": "call.started", "payload": {...}}], "total_webhooks": 5}
     */
    public function webhooks(Call $call): JsonResponse
    {
        $webhooks = $call->events()
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($event) {
                return [
                    'id' => $event->id,
                    'event_type' => $event->event_type,
                    'payload' => $event->payload,
                    'created_at' => $event->created_at->format('Y-m-d H:i:s'),
                ];
            });

        return response()->json([
            'call_id' => $call->id,
            'webhooks' => $webhooks,
            'total_webhooks' => $webhooks->count(),
        ]);
    }

    /**
     * Start a new call
     *
     * @authenticated
     * @bodyParam agent_id string required Agent ID
     * @bodyParam contact_name string required Contact name
     * @bodyParam to_number string required Phone number to call
     * @response {"data": {"call_id": "uuid", "message": "Call initiated successfully"}}
     */
    public function startCall(InitiateCallData $data, InitiateCallAction $initiateCallAction): JsonResponse
    {
        $result = $initiateCallAction->execute($data->toArray());

        if (!$result['success']) {
            return $this->errorResponse($result['message']);
        }

        return $this->successResponse([
            'call_id' => $result['call_id'],
        ], $result['message']);
    }
}
