import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface User {
  id?: string;
  _id?: string;
  name: string;
  fullName?: string;
  email: string;
  role?: string;
  phoneNumber?: string;
  phone?: string;
  mobile?: string;
  profilePicture?: string;
  profileImage?: string;
  avatar?: string;
  avatarUrl?: string;
  image?: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (user: User, accessToken: string) => void;
  updateUser: (updatedFields: Partial<User>) => void;
  setAccessToken: (accessToken: string) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}

import { normalizeImageUrl } from '../utils/imageUrl';

const sanitizeUser = (user: User | null): User | null => {
  if (!user) return null;
  const sanitized = { ...user };
  if (sanitized.profilePicture) sanitized.profilePicture = normalizeImageUrl(sanitized.profilePicture);
  if (sanitized.profileImage) sanitized.profileImage = normalizeImageUrl(sanitized.profileImage);
  if (sanitized.avatar) sanitized.avatar = normalizeImageUrl(sanitized.avatar);
  if (sanitized.avatarUrl) sanitized.avatarUrl = normalizeImageUrl(sanitized.avatarUrl);
  return sanitized;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,
      setAuth: (user, accessToken) => {
        set({ user: sanitizeUser(user), accessToken, isAuthenticated: true, isLoading: false });
      },
      updateUser: (updatedFields) => {
        set((state) => {
          const merged = state.user ? { ...state.user, ...updatedFields } : (updatedFields as User);
          return { user: sanitizeUser(merged) };
        });
      },
      setAccessToken: (accessToken) => set({ accessToken }),
      logout: () => {
        try {
          localStorage.removeItem('kosmico_auth_v1');
          localStorage.removeItem('kosmico_saved_addresses');
          localStorage.removeItem('kosmico_saved_payment_methods');
        } catch (e) {}
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
