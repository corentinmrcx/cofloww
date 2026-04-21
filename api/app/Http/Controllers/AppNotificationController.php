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
        $userId = $request->user()->id;

        $notifications = AppNotification::where('user_id', $userId)
            ->orderByDesc('created_at')
            ->limit(50)
            ->get();

        $unreadCount = AppNotification::where('user_id', $userId)
            ->whereNull('read_at')
            ->count();

        return response()->json([
            'data'         => AppNotificationResource::collection($notifications),
            'unread_count' => $unreadCount,
        ]);
    }

    public function markRead(Request $request, AppNotification $notification): JsonResponse
    {
        abort_if($notification->user_id !== $request->user()->id, 403);

        $notification->update(['read_at' => Carbon::now()]);

        return response()->json(['data' => new AppNotificationResource($notification)]);
    }

    public function markAllRead(Request $request): JsonResponse
    {
        AppNotification::where('user_id', $request->user()->id)
            ->whereNull('read_at')
            ->update(['read_at' => Carbon::now()]);

        return response()->json(['success' => true]);
    }

    public function destroy(Request $request, AppNotification $notification): JsonResponse
    {
        abort_if($notification->user_id !== $request->user()->id, 403);

        $notification->delete();

        return response()->json(['success' => true]);
    }

    public function destroyAll(Request $request): JsonResponse
    {
        AppNotification::where('user_id', $request->user()->id)->delete();

        return response()->json(['success' => true]);
    }
}
