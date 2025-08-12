import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '@/utils/api';

export interface UserProfile {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
}

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: UserProfile | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: { email: string; password: string; firstName?: string; lastName?: string }) => Promise<void>;
  fetchMe: () => Promise<void>;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      loading: false,
      error: null,
      async login(email, password) {
        set({ loading: true, error: null });
        try {
          const res = await api.post('/auth/login', { email, password });
          const payload = res.data.data ?? res.data;
          const user = payload.user as UserProfile;
          const tokens = payload.tokens as { accessToken: string; refreshToken: string; expiresIn?: number };
          set({ accessToken: tokens.accessToken, refreshToken: tokens.refreshToken, user, loading: false });
        } catch (err: any) {
          set({ loading: false, error: err?.response?.data?.error || 'Login failed' });
          throw err;
        }
      },
      async register(payload) {
        set({ loading: true, error: null });
        try {
          const res = await api.post('/auth/register', payload);
          const data = res.data.data ?? res.data;
          const user = data.user as UserProfile;
          const tokens = data.tokens as { accessToken: string; refreshToken: string; expiresIn?: number };
          set({ accessToken: tokens.accessToken, refreshToken: tokens.refreshToken, user, loading: false });
        } catch (err: any) {
          set({ loading: false, error: err?.response?.data?.error || 'Registration failed' });
          throw err;
        }
      },
      async fetchMe() {
        try {
          const res = await api.get('/auth/me');
          const user: UserProfile = res.data.data ?? res.data;
          set({ user });
        } catch {
          // ignore
        }
      },
      async refresh() {
        const refreshToken = get().refreshToken;
        if (!refreshToken) return;
        const res = await api.post('/auth/refresh', { refreshToken });
        const data = res.data.data ?? res.data;
        const tokens = data.tokens as { accessToken: string; refreshToken: string; expiresIn?: number };
        set({ accessToken: tokens.accessToken, refreshToken: tokens.refreshToken });
      },
      async logout() {
        try {
          const refreshToken = get().refreshToken;
          await api.post('/auth/logout', { refreshToken });
        } finally {
          set({ accessToken: null, refreshToken: null, user: null });
        }
      },
    }),
    {
      name: 'syncboard-auth',
      partialize: (state) => ({ accessToken: state.accessToken, refreshToken: state.refreshToken, user: state.user }),
    }
  )
);