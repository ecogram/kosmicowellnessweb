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
  type: 'UPI';
  displayName: string;
  upiId: string;
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
  type?: 'UPI';
  displayName: string;
  upiId: string;
  isDefault?: boolean;
}

// Robust helper to extract payment methods array regardless of response envelope
export const extractPaymentMethods = (payload: any): any[] => {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.savedPaymentMethods)) return payload.savedPaymentMethods;
  if (Array.isArray(payload.methods)) return payload.methods;
  if (Array.isArray(payload.paymentMethods)) return payload.paymentMethods;
  if (Array.isArray(payload.savedMethods)) return payload.savedMethods;

  if (payload.data) {
    if (Array.isArray(payload.data)) return payload.data;
    if (Array.isArray(payload.data.savedPaymentMethods)) return payload.data.savedPaymentMethods;
    if (Array.isArray(payload.data.methods)) return payload.data.methods;
    if (Array.isArray(payload.data.paymentMethods)) return payload.data.paymentMethods;
    if (Array.isArray(payload.data.savedMethods)) return payload.data.savedMethods;
    if (payload.data.user) {
      if (Array.isArray(payload.data.user.savedPaymentMethods)) return payload.data.user.savedPaymentMethods;
      if (Array.isArray(payload.data.user.paymentMethods)) return payload.data.user.paymentMethods;
    }
  }

  if (payload.user) {
    if (Array.isArray(payload.user.savedPaymentMethods)) return payload.user.savedPaymentMethods;
    if (Array.isArray(payload.user.paymentMethods)) return payload.user.paymentMethods;
  }

  return [];
};

// GET /api/payment/saved-methods
export const useSavedPaymentMethods = () => {
  return useQuery({
    queryKey: ['payment-methods'],
    queryFn: async (): Promise<SavedPaymentMethod[]> => {
      const allMethods: any[] = [];

      // 1. Primary: Fetch from /payment/saved-methods
      try {
        const { data } = await api.get('/payment/saved-methods');
        const list = extractPaymentMethods(data);
        if (list.length > 0) allMethods.push(...list);
      } catch (err) {
        console.warn('/payment/saved-methods fetch notice:', err);
      }

      // 2. Secondary fallback: /payments/saved-methods
      if (allMethods.length === 0) {
        try {
          const { data } = await api.get('/payments/saved-methods');
          const list = extractPaymentMethods(data);
          if (list.length > 0) allMethods.push(...list);
        } catch (_) {}
      }

      // 3. Fallback to /auth/profile (live backend profile endpoint)
      try {
        const { data } = await api.get('/auth/profile');
        const list = extractPaymentMethods(data);
        if (list.length > 0) allMethods.push(...list);

        const u = data?.data?.user ?? data?.user ?? data?.data;
        if (u?.upiId) {
          allMethods.push({
            type: 'UPI',
            displayName: u?.name || u?.fullName || 'UPI Account',
            upiId: u.upiId,
            isDefault: true,
          });
        }
      } catch (_) {}

      // 4. Fallback to /users/profile
      try {
        const { data } = await api.get('/users/profile');
        const list = extractPaymentMethods(data);
        if (list.length > 0) allMethods.push(...list);
      } catch (_) {}

      // 5. Also check currently stored user methods in auth store
      const storeUser = useAuthStore.getState().user as any;
      if (storeUser) {
        const storeMethods = extractPaymentMethods(storeUser);
        if (storeMethods.length > 0) allMethods.push(...storeMethods);
        if (storeUser.upiId) {
          allMethods.push({
            type: 'UPI',
            displayName: storeUser?.name || storeUser?.fullName || 'UPI Account',
            upiId: storeUser.upiId,
            isDefault: true,
          });
        }
      }

      // Normalize and deduplicate (UPI only)
      const seen = new Set<string>();
      const result: SavedPaymentMethod[] = [];

      for (const m of allMethods) {
        if (!m) continue;
        const typeUpper = String(
          m.type ||
            m.methodType ||
            (m.upiId || m.vpa ? 'UPI' : '')
        ).toUpperCase();
        if (typeUpper.includes('BANK')) continue;
        const upiId = m.upiId || m.vpa || m.upi || '';
        if (!upiId) continue;

        const displayName =
          m.displayName ||
          m.title ||
          m.name ||
          m.accountHolder ||
          'UPI Account';
        const id = String(m._id || m.id || upiId || Math.random());

        const key = (upiId || id).trim().toLowerCase();
        if (key && !seen.has(key)) {
          seen.add(key);
          result.push({
            _id: id,
            id,
            type: 'UPI',
            displayName,
            upiId,
            isDefault: !!m.isDefault,
          });
        }
      }

      if (result.length > 0) {
        updateStoreUserPaymentMethods(result);
      }

      return result;
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
      const methods = extractPaymentMethods(resData);
      if (methods.length > 0) {
        updateStoreUserPaymentMethods(methods);
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
      const methods = extractPaymentMethods(resData);
      if (methods.length > 0) {
        updateStoreUserPaymentMethods(methods);
      }
    },
  });
};

// DELETE /api/payment/save-method/{methodId}
export const useDeletePaymentMethod = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (methodId: string) => {
      const { data } = await api.delete(`/payment/save-method/${encodeURIComponent(methodId)}`);
      return data?.data ?? data;
    },
    onSuccess: (resData: any, methodId: string) => {
      queryClient.invalidateQueries({ queryKey: ['payment-methods'] });
      queryClient.invalidateQueries({ queryKey: ['auth-profile'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      const methods = extractPaymentMethods(resData);
      updateStoreUserPaymentMethods(methods);

      const currentUser = useAuthStore.getState().user;
      if (currentUser) {
        const remaining = Array.isArray(methods) ? methods : [];
        const cleanMethodId = (methodId || '').toLowerCase();
        const hasMatching = remaining.some((m: any) => (m.upiId || '').toLowerCase() === cleanMethodId);
        if (!hasMatching && (((currentUser as any).upiId || '').toLowerCase() === cleanMethodId || cleanMethodId === 'user_upi' || remaining.length === 0)) {
          useAuthStore.getState().updateUser({
            ...currentUser,
            upiId: '',
            savedPaymentMethods: remaining,
            paymentMethods: remaining,
          } as any);
        }
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

// POST /api/payment/razorpay/verify
export const useVerifyPayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (verificationData: {
      razorpay_payment_id: string;
      razorpay_order_id: string;
      razorpay_signature: string;
    }) => {
      const { data } = await api.post('/payment/razorpay/verify', verificationData);
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
