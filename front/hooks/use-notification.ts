import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "../lib/api-client"
import { queryKey } from "../lib/query-keys"

// ============================================
// Notification Services
// ============================================

export const useNotifications = (params?: { read?: boolean; page?: number; limit?: number }) => {
  return useQuery({
    queryKey: queryKey.Notifications.all(params?.page || 1),
    queryFn: () => api.get("/notifications", { params }),
  })
}

export const useUnreadNotificationCount = () => {
  return useQuery({
    queryKey: queryKey.Notifications.unreadCount(),
    queryFn: () => api.get("/notifications/unread-count"),
  })
}

export const useNotification = (id: string) => {
  return useQuery({
    queryKey: queryKey.Notifications.detail(id),
    queryFn: () => api.get(`/notifications/${id}`),
    enabled: !!id,
  })
}

export const useMarkAsRead = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (notificationId: string) => api.patch(`/notifications/${notificationId}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKey.Notifications.all(1) })
      queryClient.invalidateQueries({ queryKey: queryKey.Notifications.unreadCount() })
    },
  })
}

export const useMarkAllAsRead = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => api.patch("/notifications/read-all"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKey.Notifications.all(1) })
      queryClient.invalidateQueries({ queryKey: queryKey.Notifications.unreadCount() })
    },
  })
}
