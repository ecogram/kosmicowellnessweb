import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { useAuthStore } from '../store/useAuthStore';
import { useCartDrawerStore } from '../store/useCartDrawerStore';

export const useCart = () => {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: ['cart'],
    queryFn: async () => {
      const { data } = await api.get('/cart');
      return data.data.cart;
    },
    enabled: isAuthenticated,
  });
};

export const useAddToCart = () => {
  const queryClient = useQueryClient();
  const openDrawer = useCartDrawerStore((state) => state.openDrawer);
  
  return useMutation({
    mutationFn: async ({ productId, quantity, variant }: { productId: string; quantity: number, variant?: string }) => {
      const { data } = await api.post('/cart/items', { productId, quantity, variant });
      return data.data.cart;
    },
    onSuccess: (updatedCart) => {
      queryClient.setQueryData(['cart'], updatedCart);
      openDrawer();
    },
  });
};

export const useUpdateCartItem = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ productId, quantity, variant }: { productId: string; quantity: number, variant?: string }) => {
      const { data } = await api.patch(`/cart/items/${productId}`, { quantity, variant });
      return data.data.cart;
    },
    onSuccess: (updatedCart) => {
      queryClient.setQueryData(['cart'], updatedCart);
    },
  });
};

export const useRemoveCartItem = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ productId, variant }: { productId: string, variant?: string }) => {
      const { data } = await api.delete(`/cart/items/${productId}`, { data: { variant } });
      return data.data.cart;
    },
    onSuccess: (updatedCart) => {
      queryClient.setQueryData(['cart'], updatedCart);
    },
  });
};

export const useClearCart = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      const { data } = await api.delete('/cart');
      return data.data.cart;
    },
    onSuccess: (updatedCart) => {
      queryClient.setQueryData(['cart'], updatedCart);
    },
  });
};
