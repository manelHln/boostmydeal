<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Resources\Api\V1\NotificationResource;
use App\Models\Notification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Spatie\QueryBuilder\AllowedFilter;
use Spatie\QueryBuilder\QueryBuilder;

/**
 * @authenticated
 * @group Notifications
 */
class NotificationController extends Controller
{
    /**
     * List all notifications
     *
     * @authenticated
     * @queryParam filter[read] bool optional Filter by read status (true/false)
     * @queryParam filter[notification_type] string optional Filter by notification type
     * @queryParam sort string optional Sort by field (created_at, updated_at, read_at)
     * @response {"data": [{"id": 1, "notification_type": "call_completed", "read_at": null}], "meta": {...}}
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $notifications = QueryBuilder::for(Notification::class)
            ->allowedFilters(
                AllowedFilter::callback('read', function ($query, $value) {
                    if ($value === 'true') {
                        $query->whereNotNull('read_at');
                    } else {
                        $query->whereNull('read_at');
                    }
                }),
                AllowedFilter::exact('notification_type'),
            )
            ->allowedSorts(
                'created_at',
                'updated_at',
                'read_at',
            )
            ->defaultSort('-created_at')
            ->paginate();

        return NotificationResource::collection($notifications);
    }

    /**
     * Get a specific notification
     *
     * @authenticated
     * @urlParam notification int required The ID of the notification
     * @response {"id": 1, "notification_type": "call_completed", "data": {...}, "read_at": null}
     */
    public function show(Request $request, Notification $notification): NotificationResource
    {
        $notification = QueryBuilder::for($notification)->first();

        return new NotificationResource($notification);
    }

    /**
     * Mark a notification as read
     *
     * @authenticated
     * @urlParam notification int required The ID of the notification
     * @response {"message": "Notification marked as read"}
     */
    public function markRead(Notification $notification): JsonResponse
    {
        if ($notification->read_at === null) {
            $notification->update(['read_at' => now()]);
        }

        return response()->json(['message' => 'Notification marked as read']);
    }

    /**
     * Mark all notifications as read
     *
     * @authenticated
     * @response {"message": "All notifications marked as read"}
     */
    public function markAllRead(Request $request): JsonResponse
    {
        Notification::whereNull('read_at')->update(['read_at' => now()]);

        return response()->json(['message' => 'All notifications marked as read']);
    }
}
