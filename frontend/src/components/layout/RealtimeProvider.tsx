import React, { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useSocket } from '../../hooks/useSocket';
import { useAuthStore } from '../../store/useAuthStore';
import { api } from '../../services/api';

export const RealtimeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { socket, isConnected } = useSocket();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!socket || !isConnected) return;

    // --- REALTIME CUSTOMER EVENTS ---
    socket.on('notification:new', () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    });

    socket.on('notification:unread-count', ({ count }) => {
      queryClient.setQueryData(['unread-notifications-count'], count);
    });

    // Wishlist Live Sync
    socket.on('wishlist:updated', () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    });

    // Profile Live Sync
    socket.on('profile:updated', async ({ user }: any) => {
      if (user) {
        useAuthStore.getState().updateUser(user);
      } else {
        try {
          const res = await api.get('/users/profile');
          if (res.data?.data) {
            useAuthStore.getState().updateUser(res.data.data.user || res.data.data);
          }
        } catch (_) { }
      }
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    });

    // Address Live Sync
    socket.on('address:updated', () => {
      queryClient.invalidateQueries({ queryKey: ['address'] });
    });

    socket.on('order:created', () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    });

    socket.on('order:processing', ({ orderId }) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order', orderId] });
    });

    socket.on('order:shipped', ({ orderId }) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order', orderId] });
    });

    socket.on('order:delivered', ({ orderId }) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order', orderId] });
    });

    socket.on('order:cancelled', ({ orderId }) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order', orderId] });
    });

    socket.on('payment:success', ({ orderId }) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order', orderId] });
    });

    socket.on('payment:failed', ({ orderId }) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order', orderId] });
    });

    socket.on('review:new', () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
    });

    socket.on('review:approved', () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
    });

    socket.on('review:rejected', () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
    });

    // Cleanup on unmount
    return () => {
      socket.off('notification:new');
      socket.off('notification:unread-count');
      socket.off('wishlist:updated');
      socket.off('profile:updated');
      socket.off('address:updated');
      socket.off('order:created');
      socket.off('order:processing');
      socket.off('order:shipped');
      socket.off('order:delivered');
      socket.off('order:cancelled');
      socket.off('payment:success');
      socket.off('payment:failed');
      socket.off('review:new');
      socket.off('review:approved');
      socket.off('review:rejected');
    };
  }, [socket, isConnected, queryClient]);

  return <>{children}</>;
};
