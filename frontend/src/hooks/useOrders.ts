import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { useAuthStore } from '../store/useAuthStore';

// GET /api/payment/myorders?page=1&limit=10
export const useOrders = (params: { page?: number; limit?: number } = {}) => {
  const { isAuthenticated, accessToken } = useAuthStore();
  const hasAuth =
    isAuthenticated || !!accessToken || !!localStorage.getItem('kosmico_auth_v1');

  return useQuery({
    queryKey: ['orders', params],
    queryFn: async () => {
      const response = await api.get('/payment/myorders', { params });
      const resData = response.data?.data ?? response.data ?? {};
      const orders: any[] = resData.orders ?? (Array.isArray(resData) ? resData : []);
      const pagination = resData.pagination ?? {
        total: orders.length,
        page: 1,
        limit: params.limit ?? 10,
        totalPages: 1,
      };

      // Sort newest first
      orders.sort((a, b) => {
        const tA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const tB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        if (!isNaN(tA) && !isNaN(tB) && tA !== tB) return tB - tA;
        return (b.orderNumber ?? b._id ?? '').localeCompare(a.orderNumber ?? a._id ?? '');
      });

      return { orders, pagination };
    },
    enabled: hasAuth,
    staleTime: 5000,
    refetchInterval: 5000,
    retry: 1,
  });
};

// GET /api/order/track/{orderId}  (primary)
// Fallback: search within GET /api/payment/myorders
export const useOrder = (orderId: string) => {
  return useQuery({
    queryKey: ['orders', orderId],
    queryFn: async () => {
      if (!orderId) return null;

      // 1. Track via API docs endpoint: GET /api/order/track/{orderId}
      try {
        const response = await api.get(`/order/track/${orderId}`);
        const orderData = response.data?.data?.order ?? response.data?.data ?? response.data;
        if (orderData && (orderData._id || orderData.orderNumber)) return orderData;
      } catch (_) {}

      // 2. Search inside myorders list as secondary lookup
      try {
        const response = await api.get('/payment/myorders', { params: { limit: 100 } });
        const orders: any[] =
          response.data?.data?.orders ??
          (Array.isArray(response.data?.data) ? response.data.data : []);
        const matched = orders.find(
          (o: any) =>
            String(o._id) === String(orderId) ||
            String(o.orderNumber) === String(orderId)
        );
        if (matched) return matched;
      } catch (_) {}

      return null;
    },
    enabled: !!orderId,
    staleTime: 5000,
    refetchInterval: 5000,
    retry: 1,
  });
};

// POST /api/payment/cod — place COD order
export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      amount: number;
      deliveryAddressId: string;
      items: Array<{ productId: string; quantity: number; price: number }>;
      couponCode?: string;
      discountAmount?: number;
      deliveryFee?: number;
      gstCharge?: number;
    }) => {
      const response = await api.post('/payment/cod', data);
      const resData = response.data?.data ?? response.data ?? {};
      return resData.order ?? resData;
    },
    onSuccess: () => {
      localStorage.removeItem('kosmico_cart_v1');
      queryClient.setQueryData(['cart'], { items: [], subtotal: 0, total: 0 });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};

// POST /api/order/cancel/{orderId}
export const useCancelOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderId: string) => {
      const response = await api.post(`/order/cancel/${orderId}`);
      return response.data?.data?.order ?? response.data?.data ?? response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};

// POST /api/order/return/{orderId}
export const useReturnOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, reason }: { orderId: string; reason: string }) => {
      const response = await api.post(`/order/return/${orderId}`, { reason });
      return response.data?.data ?? response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};
