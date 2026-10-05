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
      try {
        const response = await api.get('/payment/myorders', { params });
        const resData = response.data?.data ?? response.data ?? {};
        const rawOrders: any[] = resData.orders ?? (Array.isArray(resData) ? resData : []);

        // Strictly show only valid, confirmed/completed orders — no pending, failed, or mock data
        const orders = rawOrders.filter((o: any) => {
          const payStatus = String(o.paymentStatus || '').toUpperCase();
          const ordStatus = String(o.orderStatus || o.status || '').toUpperCase();

          // Exclude any pending or failed orders where payment was not successful
          if (['PENDING', 'FAILED', 'CANCELLED'].includes(payStatus) || ordStatus === 'PENDING') {
            return false;
          }

          // Exclude mock, demo, or test orders
          const orderNum = String(o.orderNumber || o._id || '');
          if (/^TEST|^MOCK|^DEMO|^DEV_|^DUMMY_/i.test(orderNum)) {
            return false;
          }
          if (o.isTest || o.testOrder || o.isMock) {
            return false;
          }

          return true;
        });

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
      } catch (err: any) {
        console.warn('Failed to fetch orders, defaulting to empty array:', err?.message || err);
        return {
          orders: [],
          pagination: { total: 0, page: 1, limit: params.limit ?? 10, totalPages: 1 },
        };
      }
    },
    enabled: hasAuth,
    staleTime: 30 * 1000,
    retry: 1,
  });
};

// GET /api/order/track/{orderId}  (primary)
// Fallback: search within GET /api/payment/myorders
export const useOrder = (orderId: string) => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ['orders', orderId],
    queryFn: async () => {
      if (!orderId) return null;

      const normalize = (v: any) => String(v || '').replace(/^#/, '').trim().toLowerCase();
      const targetId = normalize(orderId);

      const isMatch = (o: any) => {
        if (!o) return false;
        const candidates = [
          o._id,
          o.id,
          o.orderNumber,
          o.orderId,
          o.razorpayOrderId,
          o.shiprocketOrderId,
          o.trackingNumber,
        ].filter(Boolean).map(normalize);

        return candidates.includes(targetId) || candidates.some((c) => c && (c.includes(targetId) || targetId.includes(c)));
      };

      // 0. Search across ALL cached 'orders' queries in React Query cache
      try {
        const allCachedQueries = queryClient.getQueriesData<any>({ queryKey: ['orders'] });
        for (const [, qData] of allCachedQueries) {
          const list: any[] = qData?.orders ?? (Array.isArray(qData) ? qData : []);
          const found = list.find(isMatch);
          if (found) return found;
          if (['kw-cod', 'kw-success', 'success'].includes(targetId) && list.length > 0) {
            return list[0];
          }
        }
      } catch (_) { }

      // 1. Search inside myorders list (live endpoint returns { success: true, orders: [...] })
      try {
        const response = await api.get('/payment/myorders', { params: { limit: 100 } });
        const resData = response.data?.data ?? response.data ?? {};
        const orders: any[] =
          resData.orders ??
          (Array.isArray(resData) ? resData : (Array.isArray(response.data?.data) ? response.data.data : []));
        const matched = orders.find(isMatch);
        if (matched) return matched;
        if (['kw-cod', 'kw-success', 'success'].includes(targetId) && orders.length > 0) {
          return orders[0];
        }
      } catch (_) { }

      // 2. Fallback to /order/myorders endpoint
      try {
        const response = await api.get('/order/myorders');
        const resData = response.data?.data ?? response.data ?? {};
        const orders: any[] =
          resData.orders ??
          (Array.isArray(resData) ? resData : (Array.isArray(response.data?.data) ? response.data.data : []));
        const matched = orders.find(isMatch);
        if (matched) return matched;
      } catch (_) { }

      // 3. Fallback to direct lookup endpoints (/orders/:id or /payment/:id)
      try {
        const response = await api.get(`/orders/${targetId}`);
        const ord = response.data?.data?.order ?? response.data?.order ?? response.data?.data;
        if (ord && (ord._id || ord.items)) return ord;
      } catch (_) { }

      try {
        const response = await api.get(`/payment/${targetId}`);
        const ord = response.data?.data?.order ?? response.data?.order ?? response.data?.data;
        if (ord && (ord._id || ord.items)) return ord;
      } catch (_) { }

      // 4. Track via API endpoint: GET /api/order/track/{orderId}
      try {
        const response = await api.get(`/order/track/${targetId}`);
        const orderData = response.data?.data?.order ?? response.data?.order ?? response.data?.data ?? response.data;
        if (orderData?.order && (orderData.order._id || orderData.order.orderNumber || orderData.order.items)) {
          return orderData.order;
        }
        if (orderData && (orderData._id || orderData.orderNumber || orderData.items?.length > 0)) {
          const itemsSum = Array.isArray(orderData.items)
            ? orderData.items.reduce((s: number, it: any) => s + (Number(it.price || it.priceSnapshot || 499) * Number(it.quantity || it.qty || 1)), 0)
            : 0;
          return {
            ...orderData,
            total: Number(orderData.total) || Number(orderData.amount) || itemsSum || 499,
          };
        }
        if (orderData && (orderData.orderNumber || orderData.currentStatus)) {
          const items = orderData.items || [];
          const itemsSum = items.reduce((s: number, it: any) => s + (Number(it.price || it.priceSnapshot || 499) * Number(it.quantity || it.qty || 1)), 0);
          return {
            _id: targetId,
            orderNumber: orderData.orderNumber || targetId,
            orderStatus: orderData.currentStatus || 'CONFIRMED',
            paymentStatus: orderData.paymentStatus || 'PAID',
            paymentMethod: orderData.paymentMethod || (Number(orderData.upfrontAmount) > 0 ? 'COD_UPFRONT' : 'ONLINE'),
            upfrontAmount: orderData.upfrontAmount,
            deliveryFee: orderData.deliveryFee ?? orderData.shipping,
            shipping: orderData.shipping ?? orderData.deliveryFee,
            gstCharge: orderData.gstCharge ?? orderData.tax,
            tax: orderData.tax ?? orderData.gstCharge,
            subtotal: orderData.subtotal,
            createdAt: orderData.timeline?.[0]?.timestamp || new Date().toISOString(),
            items: items,
            shippingAddress: orderData.shippingAddress || {},
            total: Number(orderData.total) || Number(orderData.amount) || itemsSum || 499,
            amount: Number(orderData.total) || Number(orderData.amount) || itemsSum || 499,
            trackingDetails: orderData,
          };
        }
      } catch (_) { }

      return null;
    },
    enabled: !!orderId,
    staleTime: 5000,
    refetchInterval: 5000,
    retry: 1,
  });
};

// GET /api/order/track/{orderId}
export const useOrderTracking = (orderId: string) => {
  return useQuery({
    queryKey: ['order-track', orderId],
    queryFn: async () => {
      if (!orderId) return null;
      const cleanId = String(orderId).replace(/^#/, '').trim();
      try {
        const response = await api.get(`/order/track/${cleanId}`);
        const data = response.data?.data ?? response.data;
        return data;
      } catch (_) {
        return null;
      }
    },
    enabled: !!orderId,
    staleTime: 15 * 1000,
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
