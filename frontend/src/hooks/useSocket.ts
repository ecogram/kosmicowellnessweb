import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../store/useAuthStore';

const getSocketURL = (): string => {
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
    if (!isAuthenticated || !accessToken) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setIsConnected(false);
      }
      return;
    }

    // Initialize socket connection
    if (!socketRef.current) {
      const socket = io(getSocketURL(), {
        path: '/socket.io',
        auth: { token: accessToken },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 3,
        reconnectionDelay: 5000,
        timeout: 8000,
        autoConnect: true,
      });

      socket.on('connect', () => {
        setIsConnected(true);
      });

      socket.on('disconnect', () => {
        setIsConnected(false);
      });

      socket.on('connect_error', () => {
        setIsConnected(false);
      });

      socketRef.current = socket;
    }

    return () => {
      // Keep persistent connection while authenticated
    };
  }, [isAuthenticated, accessToken]);

  return {
    socket: socketRef.current,
    isConnected,
  };
};
