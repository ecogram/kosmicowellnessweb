import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { useAuthStore } from '../store/useAuthStore';

interface Address {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

interface CreateOrderData {
  shippingAddress: Address;
  billingAddress?: Address;
  paymentMethod?: 'ONLINE' | 'COD';
}

export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateOrderData) => {
      // Generate unique key for this request to prevent double orders
      const idempotencyKey = crypto.randomUUID();
      const response = await api.post('/orders', data, {
        headers: {
          'Idempotency-Key': idempotencyKey,
        },
      });
      return response.data.data.order;
    },
    onSuccess: () => {
      // Clear cart locally since backend cleared it
      queryClient.setQueryData(['cart'], (oldData: any) => {
        if (!oldData) return oldData;
        return { ...oldData, items: [] };
      });
      // Invalidate orders
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};

export const useOrders = (params: { page?: number; limit?: number }) => {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: ['orders', params],
    queryFn: async () => {
      const response = await api.get('/orders', { params });
      return {
        orders: response.data.data.orders,
        pagination: response.data.meta,
      };
    },
    enabled: isAuthenticated,
  });
};

export const useOrder = (orderNumber: string) => {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: ['orders', orderNumber],
    queryFn: async () => {
      const response = await api.get(`/orders/${orderNumber}`);
      return response.data.data.order;
    },
    enabled: isAuthenticated && !!orderNumber,
  });
};

export const useCancelOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderNumber: string) => {
      const response = await api.patch(`/orders/${orderNumber}/cancel`);
      return response.data.data.order;
    },
    onSuccess: (updatedOrder) => {
      queryClient.setQueryData(['orders', updatedOrder.orderNumber], updatedOrder);
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};
