<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\CallDirection;
use App\Enums\CallStatus;
use App\Models\Call;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * @authenticated
 * @group Dashboard
 */
class DashboardController extends Controller
{
    /**
     * Get aggregated dashboard metrics
     *
     * @authenticated
     * @queryParam start_date date optional Start date for metrics (default: 30 days ago)
     * @queryParam end_date date optional End date for metrics (default: now)
     * @response {"total_calls": 100, "completed_calls": 80, "missed_calls": 15, "failed_calls": 5, "average_duration": 120, "total_cost": 5000, "inbound_calls": 60, "outbound_calls": 40, "success_rate": 80.0}
     */
    public function metrics(Request $request): JsonResponse
    {
        $startDate = $request->input('start_date')
            ? Carbon::parse($request->input('start_date'))->startOfDay()
            : Carbon::now()->subDays(30)->startOfDay();

        $endDate = $request->input('end_date')
            ? Carbon::parse($request->input('end_date'))->endOfDay()
            : Carbon::now()->endOfDay();

        $tenantId = tenant('id');

        $metrics = Call::where('tenant_id', $tenantId)
            ->whereBetween('created_at', [$startDate, $endDate])
            ->selectRaw('
                COUNT(*) as total_calls,
                COUNT(CASE WHEN status = ? THEN 1 END) as completed_calls,
                COUNT(CASE WHEN status = ? THEN 1 END) as missed_calls,
                COUNT(CASE WHEN status = ? THEN 1 END) as failed_calls,
                AVG(duration_seconds) as average_duration,
                SUM(cost) as total_cost,
                COUNT(CASE WHEN direction = ? THEN 1 END) as inbound_calls,
                COUNT(CASE WHEN direction = ? THEN 1 END) as outbound_calls
            ', [
                CallStatus::COMPLETED->value,
                CallStatus::MISSED->value,
                CallStatus::CANCELLED->value,
                CallDirection::INBOUND->value,
                CallDirection::OUTBOUND->value,
            ])
            ->first();

        return response()->json([
            'total_calls' => (int) $metrics->total_calls,
            'completed_calls' => (int) $metrics->completed_calls,
            'missed_calls' => (int) $metrics->missed_calls,
            'failed_calls' => (int) $metrics->failed_calls,
            'average_duration' => (int) round($metrics->average_duration ?? 0),
            'total_cost' => (int) ($metrics->total_cost ?? 0),
            'inbound_calls' => (int) $metrics->inbound_calls,
            'outbound_calls' => (int) $metrics->outbound_calls,
            'success_rate' => $metrics->total_calls > 0
                ? round(($metrics->completed_calls / $metrics->total_calls) * 100, 2)
                : 0,
        ]);
    }

    /**
     * Get call evolution data for charts
     *
     * @authenticated
     * @queryParam start_date date optional Start date (default: 30 days ago)
     * @queryParam end_date date optional End date (default: now)
     * @queryParam group_by string optional Group by hour/day/week/month (default: day)
     * @response [{"date": "2024-01-01", "total_calls": 10, "completed_calls": 8, "missed_calls": 2, "average_duration": 120}]
     */
    public function callEvolution(Request $request): JsonResponse
    {
        $startDate = $request->input('start_date')
            ? Carbon::parse($request->input('start_date'))->startOfDay()
            : Carbon::now()->subDays(30)->startOfDay();

        $endDate = $request->input('end_date')
            ? Carbon::parse($request->input('end_date'))->endOfDay()
            : Carbon::now()->endOfDay();

        $groupBy = $request->input('group_by', 'day'); // 'day', 'week', 'month'

        $tenantId = tenant('id');

        $dateFormat = match ($groupBy) {
            'hour' => 'YYYY-MM-DD HH24:00:00',
            'day' => 'YYYY-MM-DD',
            'week' => 'IYYY-"W"IW',
            'month' => 'YYYY-MM',
            default => 'YYYY-MM-DD',
        };

        $data = Call::where('tenant_id', $tenantId)
            ->whereBetween('created_at', [$startDate, $endDate])
            ->selectRaw("
                TO_CHAR(created_at, '{$dateFormat}') as date,
                COUNT(*) as total_calls,
                COUNT(CASE WHEN status = ? THEN 1 END) as completed_calls,
                COUNT(CASE WHEN status = ? THEN 1 END) as missed_calls,
                AVG(duration_seconds) as average_duration
            ", [CallStatus::COMPLETED->value, CallStatus::MISSED->value])
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return response()->json($data);
    }

    /**
     * Get statistics by agent
     *
     * @authenticated
     * @queryParam start_date date optional Start date (default: 30 days ago)
     * @queryParam end_date date optional End date (default: now)
     * @response [{"id": 1, "name": "Sales Agent", "total_calls": 50, "completed_calls": 40, "missed_calls": 10, "average_duration": 120, "total_cost": 2500}]
     */
    public function agentStats(Request $request): JsonResponse
    {
        $startDate = $request->input('start_date')
            ? Carbon::parse($request->input('start_date'))->startOfDay()
            : Carbon::now()->subDays(30)->startOfDay();

        $endDate = $request->input('end_date')
            ? Carbon::parse($request->input('end_date'))->endOfDay()
            : Carbon::now()->endOfDay();

        $tenantId = tenant('id');

        $stats = DB::table('calls')
            ->join('agents', 'calls.agent_id', '=', 'agents.id')
            ->where('calls.tenant_id', $tenantId)
            ->whereBetween('calls.created_at', [$startDate, $endDate])
            ->select([
                'agents.id',
                'agents.name',
                DB::raw('COUNT(*) as total_calls'),
                DB::raw('COUNT(CASE WHEN calls.status = ? THEN 1 END) as completed_calls'),
                DB::raw('COUNT(CASE WHEN calls.status = ? THEN 1 END) as missed_calls'),
                DB::raw('AVG(calls.duration_seconds) as average_duration'),
                DB::raw('SUM(calls.cost) as total_cost'),
            ])
            ->addBinding([CallStatus::COMPLETED->value, CallStatus::MISSED->value], 'select')
            ->groupBy('agents.id', 'agents.name')
            ->orderBy('total_calls', 'desc')
            ->get();

        return response()->json($stats);
    }

    /**
     * Get statistics by phone number
     *
     * @authenticated
     * @queryParam start_date date optional Start date (default: 30 days ago)
     * @queryParam end_date date optional End date (default: now)
     * @response [{"id": 1, "did": "+1234567890", "total_calls": 30, "completed_calls": 25, "missed_calls": 5, "average_duration": 115, "total_cost": 1500}]
     */
    public function phoneNumberStats(Request $request): JsonResponse
    {
        $startDate = $request->input('start_date')
            ? Carbon::parse($request->input('start_date'))->startOfDay()
            : Carbon::now()->subDays(30)->startOfDay();

        $endDate = $request->input('end_date')
            ? Carbon::parse($request->input('end_date'))->endOfDay()
            : Carbon::now()->endOfDay();

        $tenantId = tenant('id');

        $stats = DB::table('calls')
            ->join('phone_numbers', 'calls.phone_number_id', '=', 'phone_numbers.id')
            ->where('calls.tenant_id', $tenantId)
            ->whereBetween('calls.created_at', [$startDate, $endDate])
            ->select([
                'phone_numbers.id',
                'phone_numbers.did',
                DB::raw('COUNT(*) as total_calls'),
                DB::raw('COUNT(CASE WHEN calls.status = ? THEN 1 END) as completed_calls'),
                DB::raw('COUNT(CASE WHEN calls.status = ? THEN 1 END) as missed_calls'),
                DB::raw('AVG(calls.duration_seconds) as average_duration'),
                DB::raw('SUM(calls.cost) as total_cost'),
            ])
            ->addBinding([CallStatus::COMPLETED->value, CallStatus::MISSED->value], 'select')
            ->groupBy('phone_numbers.id', 'phone_numbers.did')
            ->orderBy('total_calls', 'desc')
            ->get();

        return response()->json($stats);
    }
}
