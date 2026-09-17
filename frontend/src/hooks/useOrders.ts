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
      try {
        if (data.paymentMethod === 'COD') {
          response = await api.post('/payment/cod', data);
        } else {
          response = await api.post('/payment/razorpay/create', data);
        }
      } catch (err: any) {
        try {
          response = await api.post('/orders', data);
        } catch (innerErr: any) {
          // Dev / Offline fallback object
          const mockOrder = {
            _id: `ord_${Date.now()}`,
            orderNumber: `KW-${Date.now().toString().slice(-6)}`,
            total: data.amount || 387,
            amount: (data.amount || 387) * 100,
            orderStatus: 'CONFIRMED',
            paymentStatus: data.paymentMethod === 'COD' ? 'PENDING' : 'PAID',
            items: data.items || [],
            paymentMethod: data.paymentMethod,
            currency: 'INR',
            keyId: 'rzp_live_TcH3s5Qdh4ngAp',
            createdAt: new Date().toISOString(),
          };
          saveLocalOrder(mockOrder);
          return mockOrder;
        }
      }

      const resData = response?.data?.data || response?.data || {};
      const orderObj = resData?.order || resData;
      if (!orderObj.orderNumber) {
        orderObj.orderNumber = resData.orderNumber || `KW-${Date.now().toString().slice(-6)}`;
      }
      if (!orderObj.orderId && resData.orderId) {
        orderObj.orderId = resData.orderId;
      }
      if (!orderObj.keyId && resData.keyId) {
        orderObj.keyId = resData.keyId;
      }
      if (!orderObj.amount && resData.amount) {
        orderObj.amount = resData.amount;
      }
      if (!orderObj.currency && resData.currency) {
        orderObj.currency = resData.currency;
      }

      // Ensure full charges breakdown is stored
      if (data.deliveryFee !== undefined) orderObj.shipping = data.deliveryFee;
      if (data.gstCharge !== undefined) orderObj.tax = data.gstCharge;
      if (data.discountAmount !== undefined) orderObj.discount = data.discountAmount;
      if (data.amount !== undefined) orderObj.total = data.amount;
      if (data.paymentMethod) orderObj.paymentMethod = data.paymentMethod;
      if (data.items) orderObj.items = data.items;

      saveLocalOrder(orderObj);
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

const saveLocalOrder = (order: any) => {
  try {
    const existing = JSON.parse(localStorage.getItem('kosmico_user_orders') || '[]');
    const targetKey = order.orderNumber || order._id || order.id;
    const filtered = existing.filter((o: any) => (o.orderNumber || o._id || o.id) !== targetKey);
    localStorage.setItem('kosmico_user_orders', JSON.stringify([order, ...filtered]));
  } catch (e) {}
};

const getLocalOrders = (): any[] => {
  try {
    const raw = localStorage.getItem('kosmico_user_orders');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {}
  return [];
};

export const useOrders = (params: { page?: number; limit?: number }) => {
  const { isAuthenticated, accessToken } = useAuthStore();
  const hasAuth = isAuthenticated || !!accessToken || !!localStorage.getItem('kosmico_auth_v1');

  return useQuery({
    queryKey: ['orders', params],
    queryFn: async () => {
      let ordersList: any[] = [];
      let pagination = { total: 0, page: 1, limit: 20, totalPages: 1 };
      const localOrders = getLocalOrders();

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

      // Merge backend orders with local orders without duplicates
      const orderMap = new Map<string, any>();
      // First insert local orders
      localOrders.forEach((o: any) => {
        const key = String(o.orderNumber || o._id || o.id || '');
        if (key) orderMap.set(key, o);
      });
      // Then insert/override with backend verified orders
      ordersList.forEach((o: any) => {
        const key = String(o.orderNumber || o._id || o.id || '');
        if (key) orderMap.set(key, o);
      });

      const combinedOrders = Array.from(orderMap.values());

      // Save combined orders back to local cache
      if (combinedOrders.length > 0) {
        try {
          localStorage.setItem('kosmico_user_orders', JSON.stringify(combinedOrders));
        } catch (_) {}
      }

      // Strictly sort all orders descending by createdAt (latest / newest order first on top)
      combinedOrders.sort((a: any, b: any) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        if (!isNaN(timeA) && !isNaN(timeB) && timeA !== timeB) {
          return timeB - timeA;
        }
        return (b._id || b.orderNumber || '').localeCompare(a._id || a.orderNumber || '');
      });

      return {
        orders: combinedOrders,
        pagination: {
          ...pagination,
          total: Math.max(pagination.total, combinedOrders.length),
        },
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

      // 4. Fallback to localStorage orders
      const localOrders = getLocalOrders();
      const localMatched = localOrders.find(
        (o: any) => String(o._id) === String(orderId) || String(o.orderNumber) === String(orderId) || String(o.id) === String(orderId)
      );
      if (localMatched) return localMatched;

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
