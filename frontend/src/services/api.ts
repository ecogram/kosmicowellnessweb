import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';

const getBaseURL = (): string => {
  // 1. Check environment variable
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && envUrl.trim()) {
    // If page is loaded over HTTPS, prevent mixed content block on same domain
    if (typeof window !== 'undefined' && window.location.protocol === 'https:' && envUrl.startsWith('http://kosmicowellness.com')) {
      return envUrl.replace('http://', 'https://');
    }
    return envUrl.trim();
  }

  // 2. Production domain auto-detection
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host !== 'localhost' && host !== '127.0.0.1') {
      return `${window.location.origin}/api`;
    }
  }

  // 3. Development local fallback
  return 'http://localhost:5000/api';
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
