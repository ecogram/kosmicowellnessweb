import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { useAuthStore } from '../store/useAuthStore';

// GET /api/notifications?page=1&limit=20
export const useNotifications = (page = 1, limit = 20) => {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: ['notifications', page, limit],
    queryFn: async () => {
      const { data } = await api.get('/notifications', { params: { page, limit } });
      return data?.data;
    },
    enabled: isAuthenticated,
    staleTime: 60 * 1000,
    retry: 1,
  });
};

// Compute unread count from notification list
export const useUnreadCount = () => {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: async () => {
      const { data } = await api.get('/notifications', { params: { page: 1, limit: 100 } });
      const list: any[] = data?.data?.notifications ?? (Array.isArray(data?.data) ? data.data : []);
      const unread = list.filter((n) => n.isRead === false || n.read === false).length;
      return unread;
    },
    enabled: isAuthenticated,
    staleTime: 60 * 1000,
    retry: 1,
  });
};

// PUT /api/notifications/{notificationId}/read
export const useMarkAsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.put(`/notifications/${id}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

// DELETE /api/notifications/{notificationId}
export const useDeleteNotification = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/notifications/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

// DELETE /api/notifications — clear all
export const useClearAllNotifications = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await api.delete('/notifications');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};
