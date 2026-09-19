import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';

// Always use production live Base URL: https://api.kosmicowellness.com/api
const getBaseURL = (): string => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  return 'https://api.kosmicowellness.com/api';
};

export const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'x-platform': 'web',
    'x-app-version': '1.0.3',
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
    // For FormData uploads, remove default application/json Content-Type so browser can set multipart boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
      if (config.headers && typeof config.headers.delete === 'function') {
        config.headers.delete('Content-Type');
      }
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
