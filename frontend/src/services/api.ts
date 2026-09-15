import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';

const getBaseURL = (): string => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  // In browser, relative '/api' works on localhost and on https://kosmicowellness.com/api without HTTPS Mixed Content block
  if (typeof window !== 'undefined') {
    return '/api';
  }
  return 'https://kosmicowellness.com/api';
};

export const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    let token = useAuthStore.getState().accessToken;
    if (!token) {
      try {
        const stored = JSON.parse(localStorage.getItem('kosmico_auth_v1') || '{}');
        token = stored.state?.accessToken || null;
      } catch (e) {}
    }
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    return Promise.reject(error);
  }
);
