import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "../lib/api-client"
import { queryKey } from "../lib/query-keys"
import type { Workflow, PaginatedRequest } from "../lib/types"

// ============================================
// Workflow Services
// ============================================

export const useWorkflows = (params?: PaginatedRequest) => {
  return useQuery({
    queryKey: queryKey.WorkFlows.list(params?.page || 1),
    queryFn: () => api.get("/workflows", { params }),
  })
}

export const useWorkflow = (id: string) => {
  return useQuery({
    queryKey: queryKey.WorkFlows.detail(id),
    queryFn: () => api.get(`/workflows/${id}`),
    enabled: !!id,
  })
}

export const useCreateWorkflow = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Partial<Workflow>) => api.post("/workflows", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKey.WorkFlows.all() })
    },
  })
}

export const useUpdateWorkflow = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Workflow> }) =>
      api.put(`/workflows/${id}`, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKey.WorkFlows.detail(id) })
      queryClient.invalidateQueries({ queryKey: queryKey.WorkFlows.all() })
    },
  })
}

export const useDeleteWorkflow = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => api.delete(`/workflows/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKey.WorkFlows.all() })
    },
  })
}

export const useToggleWorkflow = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      api.patch(`/workflows/${id}/toggle`, { active }),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKey.WorkFlows.detail(id) })
      queryClient.invalidateQueries({ queryKey: queryKey.WorkFlows.all() })
    },
  })
}

export const useTriggerWorkflow = () => {
  return useMutation({
    mutationFn: (id: string) => api.post(`/workflows/${id}/trigger`),
  })
}
