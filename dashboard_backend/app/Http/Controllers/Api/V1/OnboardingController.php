<?php

namespace App\Http\Controllers\Api\V1;

use App\Models\Onboarding;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

/**
 * @authenticated
 * @group Onboarding
 */
class OnboardingController extends Controller
{
    /**
     * Get the current user's onboarding status
     *
     * @authenticated
     * @response {"onboarding": {"id": 1, "current_step": 2, "completed_at": null}}
     */
    public function status(Request $request): JsonResponse
    {
        $user = Auth::user();
        $onboarding = $user->onboarding;

        if (! $onboarding) {
            $onboarding = Onboarding::create([
                'user_id' => $user->id,
                'current_step' => 1,
            ]);
        }

        return response()->json([
            'onboarding' => $onboarding,
        ]);
    }

    /**
     * Save onboarding step data
     *
     * @authenticated
     * @bodyParam step int required Step number (1-5)
     * @bodyParam company_name string optional Step 1: Company name
     * @bodyParam company_size string optional Step 1: Company size (1-10, 11-50, 51-200, 201-500, 500+)
     * @bodyParam business_objective string optional Step 1: Business objective
     * @bodyParam agent_name string optional Step 2: Agent name
     * @bodyParam agent_description string optional Step 2: Agent description
     * @bodyParam agent_language string optional Step 2: Agent language
     * @response {"message": "Step saved successfully", "onboarding": {...}}
     */
    public function saveStep(Request $request): JsonResponse
    {
        $user = Auth::user();
        $onboarding = $user->onboarding ?? Onboarding::create([
            'user_id' => $user->id,
            'current_step' => 1,
        ]);

        $step = $request->input('step');

        if (! in_array($step, [1, 2, 3, 4, 5])) {
            return response()->json([
                'error' => 'Invalid step number',
            ], 422);
        }

        $validationRules = match ($step) {
            1 => [
                'company_name' => 'required|string|max:255',
                'company_size' => 'required|string|in:1-10,11-50,51-200,201-500,500+',
                'business_objective' => 'required|string|max:500',
                'timezone' => 'required|string|max:50',
                'uploaded_files' => 'sometimes|array',
                'uploaded_files.*' => 'exists:media,id',
            ],
            2 => [
                'agent_name' => 'sometimes|string|max:255',
                'agent_description' => 'sometimes|nullable|string|max:1000',
                'agent_language' => 'sometimes|string|max:10',
                'agent_first_message' => 'sometimes|nullable|string',
                'agent_system_prompt' => 'sometimes|nullable|string',
            ],
            3 => [
                'phone_number_id' => 'sometimes|uuid|exists:phone_numbers,id',
                'phone_number_provider' => 'sometimes|string|max:50',
                'phone_number_config' => 'sometimes|array',
            ],
            4 => [
                'knowledge_base_ids' => 'sometimes|array',
                'knowledge_base_ids.*' => 'exists:knowledge_bases,id',
                'upload_pdfs' => 'sometimes|array',
                'upload_pdfs.*' => 'exists:media,id',
            ],
            5 => [
                'review_notes' => 'sometimes|nullable|string|max:1000',
                'agent_config_review' => 'sometimes|boolean',
                'phone_config_review' => 'sometimes|boolean',
                'knowledge_review' => 'sometimes|boolean',
            ],
        };

        $validated = $request->validate($validationRules);

        $onboarding->markStepComplete($step, $validated);

        return response()->json([
            'message' => 'Step saved successfully',
            'onboarding' => $onboarding->fresh(),
        ]);
    }

    /**
     * Skip onboarding
     *
     * @authenticated
     * @response {"message": "Onboarding skipped successfully", "onboarding": {...}}
     * @response 422 {"error": "Onboarding already completed"}
     */
    public function skip(Request $request): JsonResponse
    {
        $user = Auth::user();
        $onboarding = $user->onboarding ?? Onboarding::create([
            'user_id' => $user->id,
            'current_step' => 1,
        ]);

        if ($onboarding->isCompleted()) {
            return response()->json([
                'error' => 'Onboarding already completed',
            ], 422);
        }

        $onboarding->markSkipped();

        return response()->json([
            'message' => 'Onboarding skipped successfully',
            'onboarding' => $onboarding->fresh(),
        ]);
    }

    /**
     * Mark onboarding as completed
     *
     * @authenticated
     * @bodyParam step_1_data array optional Step 1 data
     * @bodyParam step_2_data array optional Step 2 data
     * @bodyParam step_3_data array optional Step 3 data
     * @bodyParam step_4_data array optional Step 4 data
     * @bodyParam step_5_data array optional Step 5 data
     * @response {"message": "Onboarding completed successfully", "onboarding": {...}}
     */
    public function complete(Request $request): JsonResponse
    {
        $user = Auth::user();
        $onboarding = $user->onboarding ?? Onboarding::create([
            'user_id' => $user->id,
            'current_step' => 1,
        ]);

        if ($onboarding->isCompleted()) {
            return response()->json([
                'error' => 'Onboarding already completed',
            ], 422);
        }

        $request->validate([
            'step_1_data' => 'required|array',
            'step_2_data' => 'sometimes|array',
            'step_3_data' => 'sometimes|array',
            'step_4_data' => 'sometimes|array',
            'step_5_data' => 'sometimes|array',
        ]);

        // Save final step data if provided
        foreach ([1, 2, 3, 4, 5] as $step) {
            if ($request->has("step_{$step}_data")) {
                $onboarding->{"step_{$step}_data"} = $request->input("step_{$step}_data");
            }
        }

        $onboarding->markCompleted();

        return response()->json([
            'message' => 'Onboarding completed successfully',
            'onboarding' => $onboarding->fresh(),
        ]);
    }

    /**
     * Get step data
     *
     * @authenticated
     * @urlParam step int required Step number (1-5)
     * @response {"step": 1, "data": {...}, "current_step": 3, "completed": false}
     */
    public function getStep(Request $request, int $step): JsonResponse
    {
        $user = Auth::user();
        $onboarding = $user->onboarding;

        if (! $onboarding) {
            return response()->json([
                'error' => 'Onboarding not found',
            ], 404);
        }

        if (! in_array($step, [1, 2, 3, 4, 5])) {
            return response()->json([
                'error' => 'Invalid step number',
            ], 422);
        }

        return response()->json([
            'step' => $step,
            'data' => $onboarding->{"step_{$step}_data"},
            'current_step' => $onboarding->current_step,
            'completed' => $onboarding->isCompleted(),
        ]);
    }
}
