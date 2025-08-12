import axios from 'axios';
import { useAuthStore } from '@/store/auth';
import { queueRequest } from '@/utils/offline';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers = config.headers || {};
    (config.headers as any).Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let pendingRequests: Array<(token: string | null) => void> = [];

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    // Network error: queue writes (POST/PUT/PATCH/DELETE) for later
    if (!error.response && originalRequest && ['post','put','patch','delete'].includes((originalRequest.method || '').toLowerCase())) {
      queueRequest({
        method: (originalRequest.method || 'post').toUpperCase() as any,
        url: originalRequest.url?.replace(api.defaults.baseURL || '', '') || '',
        body: originalRequest.data,
        headers: originalRequest.headers as any,
      });
      return Promise.resolve({ data: { success: false, queued: true } });
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const store = useAuthStore.getState();

      if (!isRefreshing) {
        isRefreshing = true;
        try {
          await useAuthStore.getState().refresh();
          const newToken = useAuthStore.getState().accessToken;
          pendingRequests.forEach((cb) => cb(newToken));
          pendingRequests = [];
          return api(originalRequest);
        } catch (refreshErr) {
          pendingRequests.forEach((cb) => cb(null));
          pendingRequests = [];
          await store.logout();
          return Promise.reject(refreshErr);
        } finally {
          isRefreshing = false;
        }
      }

      return new Promise((resolve, reject) => {
        pendingRequests.push((token) => {
          if (token) {
            (originalRequest.headers as any).Authorization = `Bearer ${token}`;
            resolve(api(originalRequest));
          } else {
            reject(error);
          }
        });
      });
    }

    return Promise.reject(error);
  }
);

export default api;