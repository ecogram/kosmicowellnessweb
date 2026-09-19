import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';

// ─── API Docs: Payment Methods ────────────────────────────────────────────────
// GET  /api/payment/saved-methods
// POST /api/payment/save-method
// PUT  /api/payment/save-method/{methodId}
// DELETE /api/payment/save-method/{methodId}

export interface SavedPaymentMethod {
  _id: string;
  id?: string;
  type: 'UPI' | 'BANK';
  displayName: string;
  upiId?: string;
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
  isDefault: boolean;
}

export const useCreatePayment = () => {
  return useMutation({
    mutationFn: async (orderPayload: any) => {
      if (typeof orderPayload === 'string') {
        const { data } = await api.post('/payment/create', { orderId: orderPayload });
        return data?.data ?? data;
      } else {
        const { data } = await api.post('/payment/razorpay/create', orderPayload);
        return data?.data ?? data;
      }
    },
  });
};

export interface SavePaymentMethodPayload {
  type: 'UPI' | 'BANK';
  displayName: string;
  upiId?: string;
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
  isDefault?: boolean;
}

// GET /api/payment/saved-methods
export const useSavedPaymentMethods = () => {
  return useQuery({
    queryKey: ['payment-methods'],
    queryFn: async (): Promise<SavedPaymentMethod[]> => {
      try {
        const { data } = await api.get('/payment/saved-methods');
        const list = data?.data?.methods ?? data?.data?.paymentMethods ?? data?.data ?? (Array.isArray(data) ? data : []);
        return (Array.isArray(list) ? list : []).map((m: any) => ({
          _id: m._id || m.id || `pm-${Date.now()}`,
          id: m._id || m.id || `pm-${Date.now()}`,
          type: ((m.type || m.methodType || (m.upiId ? 'UPI' : 'BANK')) as string).toUpperCase() as 'UPI' | 'BANK',
          displayName: m.displayName || m.title || (m.upiId ? 'UPI' : 'Bank Account'),
          upiId: m.upiId,
          bankName: m.bankName || m.cardNetwork,
          accountNumber: m.accountNumber || (m.cardLast4 ? `•••• ${m.cardLast4}` : ''),
          ifscCode: m.ifscCode,
          isDefault: !!m.isDefault,
        }));
      } catch (_) {
        return [];
      }
    },
    staleTime: 10 * 1000,
    refetchInterval: 5000,
    retry: 1,
  });
};

// POST /api/payment/save-method
export const useSavePaymentMethod = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: SavePaymentMethodPayload) => {
      const { data } = await api.post('/payment/save-method', {
        ...payload,
        methodType: payload.type,
        title: payload.displayName,
      });
      return data?.data ?? data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-methods'] });
    },
  });
};

// PUT /api/payment/save-method/{methodId}
export const useUpdatePaymentMethod = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      methodId,
      payload,
    }: {
      methodId: string;
      payload: Partial<SavePaymentMethodPayload>;
    }) => {
      const { data } = await api.put(`/payment/save-method/${methodId}`, payload);
      return data?.data ?? data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-methods'] });
    },
  });
};

// DELETE /api/payment/save-method/{methodId}
export const useDeletePaymentMethod = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (methodId: string) => {
      await api.delete(`/payment/save-method/${methodId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-methods'] });
    },
  });
};

// ─── Razorpay ─────────────────────────────────────────────────────────────────
// POST /api/payment/razorpay/create
export const useCreateRazorpayOrder = () => {
  return useMutation({
    mutationFn: async (payload: {
      amount: number;
      deliveryAddressId: string;
      items: Array<{ productId: string; quantity: number; price: number }>;
      couponCode?: string;
      discountAmount?: number;
      deliveryFee?: number;
      gstCharge?: number;
    }) => {
      const { data } = await api.post('/payment/razorpay/create', payload);
      return data?.data ?? data;
    },
  });
};

// POST /api/payment/verify
export const useVerifyPayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (verificationData: {
      razorpay_payment_id: string;
      razorpay_order_id: string;
      razorpay_signature: string;
    }) => {
      const { data } = await api.post('/payment/verify', verificationData);
      return data?.data ?? data;
    },
    onSuccess: () => {
      localStorage.removeItem('kosmico_cart_v1');
      queryClient.setQueryData(['cart'], { items: [], subtotal: 0, total: 0 });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};

// POST /api/payment/cod
export const usePlaceCodOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      amount: number;
      deliveryAddressId: string;
      items: Array<{ productId: string; quantity: number; price: number }>;
      couponCode?: string;
      discountAmount?: number;
      deliveryFee?: number;
      gstCharge?: number;
    }) => {
      const { data } = await api.post('/payment/cod', payload);
      return data?.data ?? data;
    },
    onSuccess: () => {
      localStorage.removeItem('kosmico_cart_v1');
      queryClient.setQueryData(['cart'], { items: [], subtotal: 0, total: 0 });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};

// POST /api/payment/razorpay/cancel-pending
export const useCancelPendingRazorpayOrder = () => {
  return useMutation({
    mutationFn: async (razorpayOrderId: string) => {
      const { data } = await api.post('/payment/razorpay/cancel-pending', { razorpayOrderId });
      return data?.data ?? data;
    },
  });
};

// POST /api/payment/cod-upfront/create
export const useCreateCodUpfront = () => {
  return useMutation({
    mutationFn: async (payload: {
      amount: number;
      upfrontAmount?: number;
      deliveryAddressId: string;
      deliveryAddress?: string;
      items: Array<any>;
      couponCode?: string;
      discountAmount?: number;
      deliveryFee?: number;
      gstCharge?: number;
    }) => {
      const { data } = await api.post('/payment/cod-upfront/create', payload);
      return data?.data ?? data;
    },
  });
};

// POST /api/payment/cod-upfront/verify
export const useVerifyCodUpfront = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (verificationData: {
      razorpay_payment_id: string;
      razorpay_order_id: string;
      razorpay_signature: string;
    }) => {
      const { data } = await api.post('/payment/cod-upfront/verify', verificationData);
      return data?.data ?? data;
    },
    onSuccess: () => {
      localStorage.removeItem('kosmico_cart_v1');
      queryClient.setQueryData(['cart'], { items: [], subtotal: 0, total: 0 });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};
