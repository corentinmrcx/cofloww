<?php

namespace App\Http\Controllers;

use App\Http\Resources\AppNotificationResource;
use App\Models\AppNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class AppNotificationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $notifications = AppNotification::orderByDesc('created_at')
            ->limit(50)
            ->get();

        $unreadCount = AppNotification::whereNull('read_at')->count();

        return response()->json([
            'data'         => AppNotificationResource::collection($notifications),
            'unread_count' => $unreadCount,
        ]);
    }

    public function markRead(AppNotification $notification): JsonResponse
    {
        $notification->update(['read_at' => Carbon::now()]);

        return response()->json(['data' => new AppNotificationResource($notification)]);
    }

    public function markAllRead(Request $request): JsonResponse
    {
        AppNotification::whereNull('read_at')
            ->update(['read_at' => Carbon::now()]);

        return response()->json(['success' => true]);
    }
}
