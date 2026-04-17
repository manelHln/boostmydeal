<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\WorkflowExecutionStatus;
use App\Models\Workflow;
use App\Models\WorkflowExecution;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * @authenticated
 * @group Workflows
 */
class WorkflowController extends Controller
{
    /**
     * List all workflows
     *
     * @authenticated
     * @queryParam is_active bool optional Filter by active status
     * @queryParam trigger_type string optional Filter by trigger type (phone_call_connected, transcript_complete, call_summary, etc.)
     * @queryParam per_page int optional Items per page (default: 15)
     * @response {"data": [{"id": 1, "name": "Follow-up Workflow", "is_active": true}], "meta": {...}}
     */
    public function index(Request $request): JsonResponse
    {
        $workflows = Workflow::query()
            ->when($request->has('is_active'), function ($query) use ($request) {
                $query->where('is_active', $request->boolean('is_active'));
            })
            ->when($request->has('trigger_type'), function ($query) use ($request) {
                $query->where('trigger_type', $request->input('trigger_type'));
            })
            ->with(['nodes'])
            ->orderBy('created_at', 'desc')
            ->paginate($request->input('per_page', 15));

        return response()->json($workflows);
    }

    /**
     * Store a new workflow
     *
     * @authenticated
     * @bodyParam name string required Workflow name
     * @bodyParam description string optional Workflow description
     * @bodyParam is_active bool optional Initial active status (default: false)
     * @bodyParam trigger_type string optional Trigger type (phone_call_connected, transcript_complete, call_summary, phone_call_ended, live_transcript, manual)
     * @bodyParam trigger_config array optional Trigger configuration
     * @response {"message": "Workflow created successfully", "workflow": {...}}
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'is_active' => 'sometimes|boolean',
            'trigger_type' => 'nullable|string|in:phone_call_connected,transcript_complete,call_summary,phone_call_ended,live_transcript,manual',
            'trigger_config' => 'nullable|array',
        ]);

        $workflow = Workflow::create($validated);

        return response()->json([
            'message' => 'Workflow created successfully',
            'workflow' => $workflow->load('nodes'),
        ], 201);
    }

    /**
     * Get a specific workflow
     *
     * @authenticated
     * @urlParam workflow int required The ID of the workflow
     * @response {"workflow": {"id": 1, "name": "Follow-up Workflow", "nodes": [...]}}
     */
    public function show(Workflow $workflow): JsonResponse
    {
        $workflow->load(['nodes' => function ($query) {
            $query->orderBy('position_x', 'asc');
        }]);

        return response()->json(['workflow' => $workflow]);
    }

    /**
     * Update a workflow
     *
     * @authenticated
     * @urlParam workflow int required The ID of the workflow
     * @bodyParam name string optional Workflow name
     * @bodyParam description string optional Workflow description
     * @bodyParam is_active bool optional Active status
     * @bodyParam trigger_type string optional Trigger type
     * @bodyParam trigger_config array optional Trigger configuration
     * @response {"message": "Workflow updated successfully", "workflow": {...}}
     */
    public function update(Request $request, Workflow $workflow): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string|max:1000',
            'is_active' => 'sometimes|boolean',
            'trigger_type' => 'nullable|string|in:phone_call_connected,transcript_complete,call_summary,phone_call_ended,live_transcript,manual',
            'trigger_config' => 'nullable|array',
        ]);

        $workflow->update($validated);

        return response()->json([
            'message' => 'Workflow updated successfully',
            'workflow' => $workflow->load('nodes'),
        ]);
    }

    /**
     * Delete a workflow
     *
     * @authenticated
     * @urlParam workflow int required The ID of the workflow
     * @response 204
     */
    public function destroy(Workflow $workflow): JsonResponse
    {
        $workflow->delete();

        return response()->json(null, 204);
    }

    /**
     * Get workflow execution history
     *
     * @authenticated
     * @urlParam workflow int required The ID of the workflow
     * @queryParam status string optional Filter by execution status
     * @queryParam per_page int optional Items per page (default: 15)
     * @response {"data": [{"id": 1, "status": "completed", "created_at": "2024-01-01T00:00:00Z"}], "meta": {...}}
     */
    public function executions(Request $request, Workflow $workflow): JsonResponse
    {
        $executions = $workflow->executions()
            ->when($request->has('status'), function ($query) use ($request) {
                $query->where('status', $request->input('status'));
            })
            ->orderBy('created_at', 'desc')
            ->paginate($request->input('per_page', 15));

        return response()->json($executions);
    }

    /**
     * Trigger a workflow manually
     *
     * @authenticated
     * @urlParam workflow int required The ID of the workflow
     * @bodyParam input_data array optional Input data for the workflow
     * @bodyParam call_id string optional Call ID to associate with the execution
     * @response {"message": "Workflow triggered successfully", "execution": {...}}
     */
    public function trigger(Request $request, Workflow $workflow): JsonResponse
    {
        $validated = $request->validate([
            'input_data' => 'sometimes|array',
            'call_id' => 'sometimes|uuid|exists:calls,id',
        ]);

        $execution = WorkflowExecution::create([
            'workflow_id' => $workflow->id,
            'call_id' => $validated['call_id'] ?? null,
            'status' => WorkflowExecutionStatus::PENDING->value,
            'input_data' => $validated['input_data'] ?? [],
        ]);

        // Dispatch job to execute workflow
        dispatch(function () use ($execution) {
            $execution->markAsRunning();
            // TODO: Implement workflow execution logic
            // For now, mark as completed
            $execution->markAsCompleted([
                'message' => 'Workflow execution completed',
                'timestamp' => now()->toIso8601String(),
            ]);
        });

        return response()->json([
            'message' => 'Workflow triggered successfully',
            'execution' => $execution,
        ], 201);
    }

    /**
     * Activate a workflow
     *
     * @authenticated
     * @urlParam workflow int required The ID of the workflow
     * @response {"message": "Workflow activated successfully", "workflow": {...}}
     */
    public function activate(Workflow $workflow): JsonResponse
    {
        $workflow->activate();

        return response()->json([
            'message' => 'Workflow activated successfully',
            'workflow' => $workflow,
        ]);
    }

    /**
     * Deactivate a workflow
     *
     * @authenticated
     * @urlParam workflow int required The ID of the workflow
     * @response {"message": "Workflow deactivated successfully", "workflow": {...}}
     */
    public function deactivate(Workflow $workflow): JsonResponse
    {
        $workflow->deactivate();

        return response()->json([
            'message' => 'Workflow deactivated successfully',
            'workflow' => $workflow,
        ]);
    }
}
