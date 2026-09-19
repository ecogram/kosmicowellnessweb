import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { useAuthStore } from '../store/useAuthStore';

// GET /api/notifications?page=1&limit=20
export const useNotifications = (page = 1, limit = 20) => {
  const { isAuthenticated, accessToken } = useAuthStore();
  const hasAuth = isAuthenticated || !!accessToken || !!localStorage.getItem('kosmico_auth_v1');

  return useQuery({
    queryKey: ['notifications', page, limit],
    queryFn: async () => {
      try {
        const { data } = await api.get('/notifications', { params: { page, limit } });
        const resData = data?.data ?? data ?? {};
        const notifications = resData.notifications ?? (Array.isArray(resData) ? resData : (Array.isArray(data) ? data : []));
        const pagination = resData.pagination ?? { total: notifications.length, page, limit, totalPages: 1 };
        return { notifications, pagination };
      } catch (err) {
        return { notifications: [], pagination: { total: 0, page, limit, totalPages: 1 } };
      }
    },
    enabled: hasAuth,
    staleTime: 15 * 1000,
    retry: 1,
  });
};

// Compute unread count from notification list
export const useUnreadCount = () => {
  const { isAuthenticated, accessToken } = useAuthStore();
  const hasAuth = isAuthenticated || !!accessToken || !!localStorage.getItem('kosmico_auth_v1');

  return useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: async () => {
      try {
        const { data } = await api.get('/notifications', { params: { page: 1, limit: 100 } });
        const resData = data?.data ?? data ?? {};
        const list: any[] = resData.notifications ?? (Array.isArray(resData) ? resData : (Array.isArray(data) ? data : []));
        const unread = list.filter((n) => n.isRead === false || n.read === false).length;
        return unread;
      } catch (err) {
        return 0;
      }
    },
    enabled: hasAuth,
    staleTime: 15 * 1000,
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
