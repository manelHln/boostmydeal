import { useQuery } from "@tanstack/react-query"
import { api } from "../lib/api-client"
import { queryKey } from "../lib/query-keys"
import type { DashboardMetrics, CallMetrics } from "../lib/types"

// ============================================
// Analytics Services
// ============================================

export const useDashboardMetrics = (params?: { startDate?: string; endDate?: string }) => {
  return useQuery({
    queryKey: queryKey.metrics.dashboard(params?.startDate, params?.endDate),
    queryFn: () => api.get("/analytics/dashboard", { params }),
  })
}

export const useCallMetrics = (params: { period: string; startDate?: string; endDate?: string }) => {
  return useQuery({
    queryKey: queryKey.metrics.calls(params.period, params.startDate, params.endDate),
    queryFn: () => api.get("/analytics/calls", { params }),
  })
}
