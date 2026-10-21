import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { useAuthStore } from '../store/useAuthStore';

// GET /api/notifications?page=1&limit=10
export const useNotifications = (page = 1, limit = 10) => {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: ['notifications', page, limit],
    queryFn: async () => {
      try {
        const response = await api.get('/notifications', { params: { page, limit } });
        const resData = response.data?.data ?? response.data ?? {};
        const allOrPageList: any[] = resData.notifications ?? (Array.isArray(resData) ? resData : []);
        
        const backendMeta = resData.meta ?? resData.pagination;
        const total = backendMeta?.total ?? allOrPageList.length;
        const pages = backendMeta?.pages ?? Math.max(1, Math.ceil(total / limit));

        // Fallback: If backend returned all records at once (> limit), slice for current page
        const notifications = (allOrPageList.length > limit)
          ? allOrPageList.slice((page - 1) * limit, page * limit)
          : allOrPageList;

        const calculatedPages = (allOrPageList.length > limit)
          ? Math.max(1, Math.ceil(allOrPageList.length / limit))
          : pages;

        const meta = {
          total,
          page,
          limit,
          pages: calculatedPages,
        };

        return { notifications, meta };
      } catch (err) {
        return { notifications: [], meta: { total: 0, page: 1, limit, pages: 1 } };
      }
    },
    enabled: isAuthenticated,
    staleTime: 2000,
    refetchInterval: 3000, // Real-time auto sync without manual refresh
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
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
    staleTime: 2000,
    refetchInterval: 4000, // Real-time unread badge sync
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
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

// PUT /api/notifications/read-all
export const useMarkAllAsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      try {
        await api.put('/notifications/read-all');
      } catch (err) {
        // Fallback: fetch and mark each
        const res = await api.get('/notifications', { params: { page: 1, limit: 100 } });
        const resData = res.data?.data ?? res.data ?? {};
        const list: any[] = resData.notifications ?? (Array.isArray(resData) ? resData : []);
        const unread = list.filter((n) => !n.isRead && !n.read).map((n) => n._id || n.id);
        if (unread.length > 0) {
          await Promise.all(unread.map((id) => api.put(`/notifications/${id}/read`)));
        }
      }
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

// DELETE clear all notifications (calls atomic /notifications delete endpoints)
export const useClearAllNotifications = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (ids?: string[]) => {
      try {
        await api.delete('/notifications');
      } catch (err) {
        try {
          await api.delete('/notifications/clear-all');
        } catch (_) {
          try {
            await api.delete('/notifications/clear');
          } catch (__) {
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
          }
        }
      }
    },
    onSuccess: () => {
      // Optimistically wipe cache immediately
      queryClient.setQueriesData({ queryKey: ['notifications'] }, (old: any) => {
        if (!old) return { notifications: [], meta: { total: 0, pages: 1 } };
        return { ...old, notifications: [], meta: { ...old.meta, total: 0, pages: 1 } };
      });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};
