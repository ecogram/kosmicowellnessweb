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
  const rawPic = sanitized.profilePicture || sanitized.profileImage || sanitized.avatar || sanitized.avatarUrl || sanitized.image || '';
  const normalized = normalizeImageUrl(rawPic);

  sanitized.profilePicture = normalized;
  sanitized.profileImage = normalized;
  sanitized.avatar = normalized;
  sanitized.avatarUrl = normalized;
  sanitized.image = normalized;
  return sanitized;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,
      setAuth: (newUser, accessToken) => {
        const previousUser = get().user;
        // If a different user is logging in on this browser, clear prior user's local caches
        if (previousUser && (previousUser.email !== newUser.email || previousUser._id !== newUser._id || previousUser.id !== newUser.id)) {
          try {
            localStorage.removeItem('kosmico_saved_addresses');
            localStorage.removeItem('kosmico_saved_payment_methods');
            localStorage.removeItem('kosmico_user_orders');
            localStorage.removeItem('kosmico_wishlist');
            localStorage.removeItem('kosmico_cart_v1');
          } catch (_) { }
        }
        set({ user: sanitizeUser(newUser), accessToken, isAuthenticated: true, isLoading: false });
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
          localStorage.removeItem('kosmico_user_orders');
          localStorage.removeItem('kosmico_wishlist');
          localStorage.removeItem('kosmico_cart_v1');
        } catch (e) { }
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
