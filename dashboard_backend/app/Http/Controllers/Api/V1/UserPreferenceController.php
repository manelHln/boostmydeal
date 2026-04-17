<?php

namespace App\Http\Controllers\Api\V1;

use App\Models\UserPreference;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

/**
 * @authenticated
 * @group User Preferences
 */
class UserPreferenceController extends Controller
{
    /**
     * Get the authenticated user's preferences
     *
     * @authenticated
     * @response {"id": 1, "language": "en", "email_notifications": true, "push_notifications": true, "theme": "light", "timezone": "UTC"}
     */
    public function index(Request $request): JsonResponse
    {
        $user = Auth::user();
        $preferences = $user->preferences ?? UserPreference::create([
            'user_id' => $user->id,
            'language' => 'en',
            'email_notifications' => true,
            'push_notifications' => true,
            'theme' => 'light',
            'timezone' => 'UTC',
        ]);

        return response()->json($preferences);
    }

    /**
     * Update the authenticated user's preferences
     *
     * @authenticated
     * @bodyParam language string optional Language code (max: 10)
     * @bodyParam email_notifications bool optional Enable email notifications
     * @bodyParam push_notifications bool optional Enable push notifications
     * @bodyParam theme string optional Theme (light, dark, auto)
     * @bodyParam timezone string optional Timezone (max: 50)
     * @response {"message": "Preferences updated successfully", "preferences": {...}}
     */
    public function update(Request $request): JsonResponse
    {
        $user = Auth::user();
        $preferences = $user->preferences ?? UserPreference::create([
            'user_id' => $user->id,
            'language' => 'en',
            'email_notifications' => true,
            'push_notifications' => true,
            'theme' => 'light',
            'timezone' => 'UTC',
        ]);

        $validated = $request->validate([
            'language' => 'sometimes|string|max:10',
            'email_notifications' => 'sometimes|boolean',
            'push_notifications' => 'sometimes|boolean',
            'theme' => 'sometimes|in:light,dark,auto',
            'timezone' => 'sometimes|string|max:50',
            'preferences' => 'sometimes|array',
        ]);

        $preferences->update($validated);

        return response()->json([
            'message' => 'Preferences updated successfully',
            'preferences' => $preferences->fresh(),
        ]);
    }
}
