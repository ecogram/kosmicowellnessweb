import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { useAuthStore } from '../store/useAuthStore';

// ─── API Docs: Payment Methods ────────────────────────────────────────────────
// GET  /api/payment/saved-methods
// POST /api/payment/save-method
// PUT  /api/payment/save-method/{methodId}
// DELETE /api/payment/save-method/{methodId}

export interface SavedPaymentMethod {
  _id?: string;
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
      const { data } = await api.get('/payment/saved-methods');
      const list = data?.data?.methods ?? data?.data?.paymentMethods ?? (Array.isArray(data?.data) ? data?.data : (Array.isArray(data) ? data : []));
      return list as SavedPaymentMethod[];
    },
    staleTime: 1000,
    refetchInterval: 3000,
    retry: 1,
  });
};

const updateStoreUserPaymentMethods = (methods: any) => {
  if (Array.isArray(methods)) {
    const currentUser = useAuthStore.getState().user;
    if (currentUser) {
      useAuthStore.getState().updateUser({
        ...currentUser,
        savedPaymentMethods: methods,
        paymentMethods: methods,
      } as any);
    }
  }
};

// POST /api/payment/save-method
export const useSavePaymentMethod = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: SavePaymentMethodPayload) => {
      const { data } = await api.post('/payment/save-method', payload);
      return data?.data ?? data;
    },
    onSuccess: (resData: any) => {
      queryClient.invalidateQueries({ queryKey: ['payment-methods'] });
      queryClient.invalidateQueries({ queryKey: ['auth-profile'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      if (resData?.methods) {
        updateStoreUserPaymentMethods(resData.methods);
      }
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
    onSuccess: (resData: any) => {
      queryClient.invalidateQueries({ queryKey: ['payment-methods'] });
      queryClient.invalidateQueries({ queryKey: ['auth-profile'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      if (resData?.methods) {
        updateStoreUserPaymentMethods(resData.methods);
      }
    },
  });
};

// DELETE /api/payment/save-method/{methodId}
export const useDeletePaymentMethod = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (methodId: string) => {
      const { data } = await api.delete(`/payment/save-method/${methodId}`);
      return data?.data ?? data;
    },
    onSuccess: (resData: any) => {
      queryClient.invalidateQueries({ queryKey: ['payment-methods'] });
      queryClient.invalidateQueries({ queryKey: ['auth-profile'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      if (resData?.methods) {
        updateStoreUserPaymentMethods(resData.methods);
      }
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
