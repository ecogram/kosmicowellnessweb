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

// Robust helper to extract wishlist items from any API response structure
export const extractWishlistItems = (payload: any): any[] => {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;

  if (Array.isArray(payload.items)) return payload.items;
  if (Array.isArray(payload.wishlist)) return payload.wishlist;

  if (payload.wishlist && Array.isArray(payload.wishlist.items)) {
    return payload.wishlist.items;
  }

  if (payload.data) {
    if (Array.isArray(payload.data)) return payload.data;
    if (Array.isArray(payload.data.items)) return payload.data.items;
    if (Array.isArray(payload.data.wishlist)) return payload.data.wishlist;
    if (payload.data.wishlist && Array.isArray(payload.data.wishlist.items)) {
      return payload.data.wishlist.items;
    }
  }

  return [];
};

// Normalize raw server items into clean WishlistItem structure
export const normalizeWishlistItems = (rawList: any[]): WishlistItem[] => {
  if (!Array.isArray(rawList)) return [];
  return rawList
    .map((raw: any) => {
      if (!raw) return null;
      const p = raw.product || raw;
      const id = String(p._id || p.id || (typeof raw === 'string' ? raw : '')).trim();
      if (!id) return null;

      const name = p.name || 'Kosmico Wellness Product';
      const slug = p.slug || id;
      const price = typeof p.price === 'number' ? p.price : (Number(p.price) || 0);
      const compareAtPrice = typeof p.compareAtPrice === 'number' ? p.compareAtPrice : undefined;
      const image = p.image || (Array.isArray(p.images) && p.images.length > 0 ? p.images[0] : '/assets/products/product-box.jpg');

      return {
        _id: id,
        id,
        name,
        slug,
        price,
        compareAtPrice,
        image,
        images: p.images || (p.image ? [p.image] : []),
        product: p,
      } as WishlistItem;
    })
    .filter((item): item is WishlistItem => item !== null);
};

export const useWishlist = () => {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: ['wishlist', isAuthenticated],
    queryFn: async () => {
      if (!isAuthenticated) {
        return { items: [] };
      }

      const { data } = await api.get('/wishlist');
      const rawItems = extractWishlistItems(data);
      const items = normalizeWishlistItems(rawItems);

      return { items };
    },
    enabled: isAuthenticated,
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
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

      // Check current wishlist in cache to determine add or remove
      const current = queryClient.getQueryData<{ items: WishlistItem[] }>(['wishlist', true]);
      const existsInWishlist = current?.items?.some(
        (item) => (item._id ?? item.id)?.toString() === productId.toString()
      );

      if (existsInWishlist) {
        let resData: any;
        try {
          const res = await api.delete('/wishlist/remove', { data: { productId } });
          resData = res.data;
        } catch (_) {
          const res = await api.delete(`/wishlist/${productId}`);
          resData = res.data;
        }
        return { action: 'removed', productId, data: resData };
      } else {
        const { data } = await api.post('/wishlist/add', { productId });
        return { action: 'added', productId, data };
      }
    },
    onSuccess: (result) => {
      if (result?.data) {
        const rawItems = extractWishlistItems(result.data);
        if (rawItems.length > 0) {
          const items = normalizeWishlistItems(rawItems);
          queryClient.setQueryData(['wishlist', true], { items });
          queryClient.setQueryData(['wishlist'], { items });
        }
      }
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      queryClient.refetchQueries({ queryKey: ['wishlist'] });
    },
  });
};
