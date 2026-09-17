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
  deliveryAddressId?: string;
  paymentMethod?: 'ONLINE' | 'COD';
  items?: Array<{
    productId: string;
    quantity: number;
    price: number;
  }>;
  amount?: number;
  couponCode?: string;
  discountAmount?: number;
  deliveryFee?: number;
  gstCharge?: number;
}

export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateOrderData) => {
      let response;
      if (data.paymentMethod === 'COD') {
        response = await api.post('/payment/cod', data);
      } else {
        response = await api.post('/payment/razorpay/create', data);
      }

      const resData = response?.data?.data || response?.data || {};
      const orderObj = resData?.order || resData;
      return orderObj;
    },
    onSuccess: () => {
      // Clear cart locally
      localStorage.removeItem('kosmico_cart_v1');
      queryClient.setQueryData(['cart'], { items: [], subtotal: 0, total: 0 });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};

export const useOrders = (params: { page?: number; limit?: number }) => {
  const { isAuthenticated, accessToken } = useAuthStore();
  const hasAuth = isAuthenticated || !!accessToken || !!localStorage.getItem('kosmico_auth_v1');

  return useQuery({
    queryKey: ['orders', params],
    queryFn: async () => {
      let ordersList: any[] = [];
      let pagination = { total: 0, page: 1, limit: 20, totalPages: 1 };

      try {
        const response = await api.get('/payment/myorders', { params });
        const resData = response.data?.data || response.data || {};
        ordersList = resData.orders || (Array.isArray(resData) ? resData : []);
        pagination = resData.pagination || { total: ordersList.length, page: 1, limit: 20, totalPages: 1 };
      } catch (err) {
        try {
          const response = await api.get('/orders', { params });
          const resData = response.data?.data || response.data || {};
          ordersList = resData.orders || (Array.isArray(resData) ? resData : []);
          pagination = resData.pagination || resData.meta || { total: ordersList.length, page: 1, limit: 20, totalPages: 1 };
        } catch (innerErr) {
          ordersList = [];
        }
      }

      // Strictly sort all orders descending by createdAt (latest / newest order first on top)
      ordersList.sort((a: any, b: any) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        if (!isNaN(timeA) && !isNaN(timeB) && timeA !== timeB) {
          return timeB - timeA;
        }
        return (b.orderNumber || b._id || '').localeCompare(a.orderNumber || a._id || '');
      });

      return {
        orders: ordersList,
        pagination,
      };
    },
    enabled: hasAuth,
    staleTime: 5000,
  });
};

export const useOrder = (orderId: string) => {
  return useQuery({
    queryKey: ['orders', orderId],
    queryFn: async () => {
      if (!orderId) return null;

      // 1. Fetch from /orders/:orderId
      try {
        const response = await api.get(`/orders/${orderId}`);
        const orderData = response.data?.data?.order || response.data?.data || response.data;
        if (orderData && (orderData._id || orderData.orderNumber)) return orderData;
      } catch (e) {}

      // 2. Fetch from /payment/myorders
      try {
        const response = await api.get('/payment/myorders', { params: { limit: 100 } });
        const orders = response.data?.data?.orders || response.data?.orders || (Array.isArray(response.data?.data) ? response.data.data : []);
        const matched = orders.find(
          (o: any) => String(o._id) === String(orderId) || String(o.orderNumber) === String(orderId) || String(o.shiprocketOrderId) === String(orderId)
        );
        if (matched) return matched;
      } catch (e) {}

      // 3. Fetch from /order/track/:orderId
      try {
        const response = await api.get(`/order/track/${orderId}`);
        if (response.data?.data) return response.data.data;
      } catch (e) {}

      return null;
    },
    enabled: !!orderId,
    staleTime: 5000,
  });
};

export const useCancelOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderNumber: string) => {
      let response;
      try {
        response = await api.post(`/order/cancel/${orderNumber}`);
      } catch (err) {
        response = await api.patch(`/orders/${orderNumber}/cancel`);
      }
      return response.data?.data?.order || response.data?.data || response.data;
    },
    onSuccess: (updatedOrder) => {
      queryClient.setQueryData(['orders', updatedOrder?.orderNumber], updatedOrder);
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};
