import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "../lib/api-client"
import { queryKey } from "../lib/query-keys"
import type { Call, PaginatedRequest, InitiateCallRequest } from "../lib/types"

// ============================================
// Call Services
// ============================================

export const useCalls = (params?: PaginatedRequest) => {
  return useQuery({
    queryKey: queryKey.Calls.all(params?.page || 1),
    queryFn: () => api.get("/calls", { params }),
  })
}

export const useCall = (id: string) => {
  return useQuery({
    queryKey: queryKey.Calls.detail(id),
    queryFn: () => api.get(`/calls/${id}`),
    enabled: !!id,
  })
}

export const useCallTranscription = (callId: string) => {
  return useQuery({
    queryKey: queryKey.Calls.transcription(callId),
    queryFn: () => api.get(`/calls/${callId}/transcription`),
    enabled: !!callId,
  })
}

export const useInitiateCall = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: InitiateCallRequest) => api.post("/calls/initiate", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKey.Calls.all(1) })
    },
  })
}

export const useExportCalls = () => {
  return useMutation({
    mutationFn: (params: { format: "csv" | "json"; startDate?: string; endDate?: string }) =>
      api.post("/calls/export", params),
  })
}
