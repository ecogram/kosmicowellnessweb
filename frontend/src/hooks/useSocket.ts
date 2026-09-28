import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../store/useAuthStore';

const getSocketURL = (): string => {
  if (import.meta.env.VITE_SOCKET_URL) {
    return import.meta.env.VITE_SOCKET_URL;
  }
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '');
  }
  if (typeof window !== 'undefined') {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://localhost:5000';
    }
    return 'https://api.kosmicowellness.com';
  }
  return 'https://api.kosmicowellness.com';
};

export const useSocket = () => {
  const { accessToken, isAuthenticated } = useAuthStore();
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Initialize socket connection (works for both guests and authenticated users)
    if (!socketRef.current) {
      const socket = io(getSocketURL(), {
        path: '/socket.io',
        auth: { token: accessToken || undefined },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 3000,
        timeout: 8000,
        autoConnect: true,
      });

      socket.on('connect', () => {
        setIsConnected(true);
        if (accessToken) {
          socket.emit('authenticate', accessToken);
        }
      });

      socket.on('disconnect', () => {
        setIsConnected(false);
      });

      socket.on('connect_error', () => {
        setIsConnected(false);
      });

      socketRef.current = socket;
    } else {
      // If token changed, update socket auth and authenticate in runtime
      socketRef.current.auth = { token: accessToken || undefined };
      if (accessToken && socketRef.current.connected) {
        socketRef.current.emit('authenticate', accessToken);
      }
    }
  }, [isAuthenticated, accessToken]);

  return {
    socket: socketRef.current,
    isConnected,
  };
};
