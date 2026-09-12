import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';

const getBaseURL = (): string => {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    // When running in browser on live production domain (kosmicowellness.com, vercel.app)
    if (host !== 'localhost' && host !== '127.0.0.1') {
      return '/api';
    }
  }

  // Local development / explicit environment variable
  return import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
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
