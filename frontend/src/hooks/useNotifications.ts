import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { useAuthStore } from '../store/useAuthStore';

const getStorageKeys = (userId?: string) => {
  const uid = userId || 'default';
  return {
    deletedKey: `kosmico_deleted_notifs_${uid}`,
    clearedKey: `kosmico_notifs_cleared_at_${uid}`,
  };
};

export const getDeletedNotificationIds = (userId?: string): string[] => {
  try {
    const { deletedKey } = getStorageKeys(userId);
    const raw = localStorage.getItem(deletedKey);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const addDeletedNotificationId = (id: string, userId?: string) => {
  try {
    const { deletedKey } = getStorageKeys(userId);
    const current = getDeletedNotificationIds(userId);
    if (!current.includes(id)) {
      current.push(id);
      localStorage.setItem(deletedKey, JSON.stringify(current));
    }
  } catch {}
};

export const getNotificationsClearedAt = (userId?: string): number => {
  try {
    const { clearedKey } = getStorageKeys(userId);
    const raw = localStorage.getItem(clearedKey);
    return raw ? Number(raw) : 0;
  } catch {
    return 0;
  }
};

export const setNotificationsClearedAt = (userId?: string) => {
  try {
    const { clearedKey, deletedKey } = getStorageKeys(userId);
    localStorage.setItem(clearedKey, Date.now().toString());
    localStorage.setItem(deletedKey, JSON.stringify([]));
  } catch {}
};

// GET /api/notifications?page=1&limit=10
export const useNotifications = (page = 1, limit = 10) => {
  const { user, isAuthenticated } = useAuthStore();
  const userId = user?._id || user?.id;

  return useQuery({
    queryKey: ['notifications', userId, page, limit],
    queryFn: async () => {
      try {
        const response = await api.get('/notifications', { params: { page: 1, limit: 100 } });
        const resData = response.data?.data ?? response.data ?? {};
        const allList: any[] = resData.notifications ?? (Array.isArray(resData) ? resData : []);

        const deletedIds = getDeletedNotificationIds(userId);
        const clearedAt = getNotificationsClearedAt(userId);

        const validNotifications = allList.filter((n: any) => {
          const id = n._id || n.id;
          if (id && deletedIds.includes(id)) return false;
          if (clearedAt && n.createdAt) {
            const notifTime = new Date(n.createdAt).getTime();
            if (notifTime <= clearedAt) return false;
          }
          return true;
        });

        const total = validNotifications.length;
        const pages = Math.max(1, Math.ceil(total / limit));
        const paginated = validNotifications.slice((page - 1) * limit, page * limit);

        const meta = {
          total,
          page,
          limit,
          pages,
        };

        return { notifications: paginated, meta };
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
  const { user, isAuthenticated } = useAuthStore();
  const userId = user?._id || user?.id;

  return useQuery({
    queryKey: ['notifications', 'unread-count', userId],
    queryFn: async () => {
      try {
        const response = await api.get('/notifications', { params: { page: 1, limit: 100 } });
        const resData = response.data?.data ?? response.data ?? {};
        const list: any[] = resData.notifications ?? (Array.isArray(resData) ? resData : []);

        const deletedIds = getDeletedNotificationIds(userId);
        const clearedAt = getNotificationsClearedAt(userId);

        const unread = list.filter((n: any) => {
          const id = n._id || n.id;
          if (id && deletedIds.includes(id)) return false;
          if (clearedAt && n.createdAt) {
            const notifTime = new Date(n.createdAt).getTime();
            if (notifTime <= clearedAt) return false;
          }
          return n.isRead === false || n.read === false;
        }).length;

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
  const { user } = useAuthStore();
  const userId = user?._id || user?.id;

  return useMutation({
    mutationFn: async (id: string) => {
      addDeletedNotificationId(id, userId);
      try {
        await api.delete(`/notifications/${id}`);
      } catch (_) {}
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

// DELETE clear all notifications (calls atomic /notifications delete endpoints)
export const useClearAllNotifications = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const userId = user?._id || user?.id;

  return useMutation({
    mutationFn: async (ids?: string[]) => {
      setNotificationsClearedAt(userId);
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
            if (targetIds && targetIds.length > 0) {
              await Promise.all(targetIds.map((id) => api.delete(`/notifications/${id}`).catch(() => {})));
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
