import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { useAuthStore } from '../store/useAuthStore';

export const useNotifications = (page = 1, limit = 20) => {
  const { isAuthenticated } = useAuthStore();
  
  return useQuery({
    queryKey: ['notifications', page, limit],
    queryFn: async () => {
      const { data } = await api.get('/notifications', { params: { page, limit } });
      return data.data;
    },
    enabled: isAuthenticated,
    refetchInterval: 30000, // Poll every 30 seconds
  });
};

export const useUnreadCount = () => {
  const { isAuthenticated } = useAuthStore();
  
  return useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: async () => {
      const { data } = await api.get('/notifications/unread-count');
      return data.data.count;
    },
    enabled: isAuthenticated,
    refetchInterval: 30000,
  });
};

export const useMarkAsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      try {
        await api.put(`/notifications/${id}/read`);
      } catch (err) {
        await api.patch(`/notifications/${id}/read`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

export const useMarkAllAsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      try {
        await api.patch('/notifications/read-all');
      } catch (err) {
        await api.put('/notifications/read-all');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

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
