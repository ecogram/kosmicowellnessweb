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

import { normalizeImageUrl } from '../utils/imageUrl';

export const useWishlist = () => {
  const { isAuthenticated, accessToken } = useAuthStore();
  const hasAuth = isAuthenticated || !!accessToken || !!localStorage.getItem('kosmico_auth_v1');

  return useQuery({
    queryKey: ['wishlist', hasAuth],
    queryFn: async () => {
      if (!hasAuth) {
        return { items: [] };
      }

      try {
        const { data } = await api.get('/wishlist');
        const serverWishlist = data?.data?.wishlist ?? data?.data ?? (Array.isArray(data) ? data : []);
        const rawItems: any[] = Array.isArray(serverWishlist?.items)
          ? serverWishlist.items
          : Array.isArray(serverWishlist)
          ? serverWishlist
          : [];

        const items: WishlistItem[] = rawItems.map((item: any) => {
          const prod = item.product || item;
          const pic = prod.image || (prod.images && prod.images[0]) || '';
          return {
            _id: prod._id || prod.id || item._id || item.id,
            id: prod._id || prod.id || item._id || item.id,
            name: prod.name || prod.title || 'Product',
            slug: prod.slug || prod._id,
            price: Number(prod.price || prod.discountPrice || 0),
            compareAtPrice: Number(prod.compareAtPrice || prod.originalPrice || 0),
            image: normalizeImageUrl(pic),
            images: Array.isArray(prod.images) ? prod.images.map(normalizeImageUrl) : [],
            product: prod,
          };
        });

        return { items };
      } catch (err) {
        return { items: [] };
      }
    },
    enabled: hasAuth,
    staleTime: 30 * 1000,
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
