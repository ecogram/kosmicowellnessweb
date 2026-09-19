import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { useAuthStore } from '../store/useAuthStore';

export interface WishlistItem {
  _id: string;
  id?: string;
  name: string;
  slug?: string;
  price: number;
  compareAtPrice?: number;
  image?: string;
  images?: string[];
  product?: any;
}

export const useWishlist = () => {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: ['wishlist', isAuthenticated],
    queryFn: async () => {
      if (!isAuthenticated) {
        // Wishlist is a protected route — return empty for guests
        return { items: [] };
      }

      const { data } = await api.get('/wishlist');
      const serverWishlist = data?.data?.wishlist ?? data?.data;
      const items: WishlistItem[] = Array.isArray(serverWishlist?.items)
        ? serverWishlist.items
        : Array.isArray(serverWishlist)
        ? serverWishlist
        : [];

      return { items };
    },
    enabled: isAuthenticated,
    staleTime: 60 * 1000, // 1 minute
    retry: 1,
    initialData: { items: [] },
  });
};

export interface ToggleWishlistPayload {
  _id?: string;
  id?: string;
  [key: string]: any;
}

export const useToggleWishlist = () => {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuthStore();

  return useMutation({
    mutationFn: async (input: string | ToggleWishlistPayload) => {
      if (!isAuthenticated) {
        throw new Error('Please login to use wishlist');
      }

      const productId = typeof input === 'string' ? input : (input._id ?? input.id ?? '');
      if (!productId) throw new Error('Invalid product ID');

      // Check current wishlist to determine add or remove
      const current = queryClient.getQueryData<{ items: WishlistItem[] }>(['wishlist', true]);
      const existsInWishlist = current?.items?.some(
        (item) => (item._id ?? item.id)?.toString() === productId.toString()
      );

      if (existsInWishlist) {
        // POST /api/wishlist/remove — exact per API docs
        await api.delete('/wishlist/remove', { data: { productId } });
        return { action: 'removed', productId };
      } else {
        // POST /api/wishlist/add — exact per API docs
        await api.post('/wishlist/add', { productId });
        return { action: 'added', productId };
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    },
  });
};
