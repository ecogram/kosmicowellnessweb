import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface User {
  id?: string;
  _id?: string;
  name: string;
  email: string;
  role?: string;
  phoneNumber?: string;
  profilePicture?: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (user: User, accessToken: string) => void;
  setAccessToken: (accessToken: string) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,
      setAuth: (user, accessToken) => {
        set({ user, accessToken, isAuthenticated: true, isLoading: false });
      },
      setAccessToken: (accessToken) => set({ accessToken }),
      logout: () => {
        set({ user: null, accessToken: null, isAuthenticated: false, isLoading: false });
      },
      setLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: 'kosmico_auth_v1',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
