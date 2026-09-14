import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { useAuthStore } from '../store/useAuthStore';

const LOCAL_STORAGE_KEY = 'kosmico_local_wishlist_items_v2';

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

const getLocalWishlist = (): WishlistItem[] => {
  if (typeof window === 'undefined') return [];
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    return [];
  }
};

const saveLocalWishlist = (items: WishlistItem[]) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
  } catch (e) {}
};

export const useWishlist = () => {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: ['wishlist', isAuthenticated],
    queryFn: async () => {
      const localItems = getLocalWishlist();

      if (!isAuthenticated) {
        return { items: localItems };
      }

      try {
        const { data } = await api.get('/wishlist');
        const serverWishlist = data.data.wishlist;
        const serverItems = serverWishlist?.items || [];
        
        // Merge server items with any local items
        const mergedMap = new Map<string, any>();
        serverItems.forEach((item: any) => {
          const id = (item?._id || item?.id || item)?.toString();
          if (id) mergedMap.set(id, item);
        });
        localItems.forEach((item: any) => {
          const id = (item?._id || item?.id || item)?.toString();
          if (id && !mergedMap.has(id)) {
            mergedMap.set(id, item);
          }
        });

        const combinedItems = Array.from(mergedMap.values());
        saveLocalWishlist(combinedItems);
        return { ...serverWishlist, items: combinedItems };
      } catch (err) {
        // Fallback to local storage if API is unreachable
        return { items: localItems };
      }
    },
    initialData: () => ({ items: getLocalWishlist() }),
  });
};

export interface ToggleWishlistPayload {
  id?: string;
  _id?: string;
  name?: string;
  slug?: string;
  price?: number;
  image?: string;
  images?: string[];
  [key: string]: any;
}

export const useToggleWishlist = () => {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuthStore();
  
  return useMutation({
    mutationFn: async (input: string | ToggleWishlistPayload) => {
      const productId = typeof input === 'string' ? input : (input._id || input.id || '');
      const localList = getLocalWishlist();
      
      const existsIndex = localList.findIndex((item) => {
        const id = (item._id || item.id || item)?.toString();
        return id === productId?.toString();
      });

      let updatedList: WishlistItem[];
      const isRemoving = existsIndex > -1;

      if (isRemoving) {
        updatedList = localList.filter((_, idx) => idx !== existsIndex);
      } else {
        const newItem: WishlistItem = typeof input === 'object' ? {
          _id: productId,
          id: productId,
          name: input.name || 'Sweet Monk (250ml)',
          slug: input.slug || productId,
          price: input.price || 387,
          compareAtPrice: input.compareAtPrice || 499,
          image: input.image || (input.images?.length ? input.images[0] : '/assets/products/product-box.jpg'),
        } : {
          _id: productId,
          id: productId,
          name: 'Sweet Monk (250ml)',
          price: 387,
          image: '/assets/products/product-box.jpg',
        };
        updatedList = [newItem, ...localList];
      }

      // Save locally first for instant, guaranteed offline-ready persistence
      saveLocalWishlist(updatedList);

      // If authenticated, sync with backend API
      if (isAuthenticated && productId) {
        try {
          if (isRemoving) {
            await api.delete(`/wishlist/items/${productId}`);
          } else {
            await api.post('/wishlist/items', { productId });
          }
        } catch (apiErr) {
          console.warn('Backend wishlist sync notice:', apiErr);
        }
      }

      return { items: updatedList };
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['wishlist'] });
      const previousWishlist = queryClient.getQueryData(['wishlist', isAuthenticated]) || { items: getLocalWishlist() };
      return { previousWishlist };
    },
    onSuccess: (updatedWishlist) => {
      queryClient.setQueryData(['wishlist', isAuthenticated], updatedWishlist);
      queryClient.setQueryData(['wishlist', true], updatedWishlist);
      queryClient.setQueryData(['wishlist', false], updatedWishlist);
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    },
  });
};
