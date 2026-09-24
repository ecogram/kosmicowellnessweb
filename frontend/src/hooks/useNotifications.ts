import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { useAuthStore } from '../store/useAuthStore';

// GET /api/notifications?page=1&limit=20
export const useNotifications = (page = 1, limit = 20) => {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: ['notifications', page, limit],
    queryFn: async () => {
      try {
        const response = await api.get('/notifications', { params: { page, limit } });
        const resData = response.data?.data ?? response.data ?? {};
        const notifications = resData.notifications ?? (Array.isArray(resData) ? resData : []);
        const meta = resData.meta ?? resData.pagination ?? { total: notifications.length, page, limit, pages: 1 };
        return { notifications, meta };
      } catch (err) {
        return { notifications: [], meta: { total: 0, page: 1, limit, pages: 1 } };
      }
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
      try {
        const response = await api.get('/notifications', { params: { page: 1, limit: 100 } });
        const resData = response.data?.data ?? response.data ?? {};
        const list: any[] = resData.notifications ?? (Array.isArray(resData) ? resData : []);
        const unread = list.filter((n) => n.isRead === false || n.read === false).length;
        return unread;
      } catch (err) {
        return 0;
      }
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

// DELETE clear all notifications (reliably deletes notifications via /api/notifications/:id)
export const useClearAllNotifications = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (ids?: string[]) => {
      let targetIds = ids;
      if (!targetIds || targetIds.length === 0) {
        const res = await api.get('/notifications', { params: { page: 1, limit: 100 } });
        const resData = res.data?.data ?? res.data ?? {};
        const list: any[] = resData.notifications ?? (Array.isArray(resData) ? resData : []);
        targetIds = list.map((n: any) => n._id || n.id).filter(Boolean);
      }

      if (targetIds && targetIds.length > 0) {
        await Promise.all(targetIds.map((id) => api.delete(`/notifications/${id}`)));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};
