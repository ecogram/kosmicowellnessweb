import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';

// Analytics
export const useAdminAnalytics = () => {
  return useQuery({
    queryKey: ['admin', 'analytics'],
    queryFn: async () => {
      const { data } = await api.get('/admin/analytics/overview');
      return data.data;
    },
  });
};

// Users
export const useAdminUsers = (page = 1, limit = 20, search = '') => {
  return useQuery({
    queryKey: ['admin', 'users', page, limit, search],
    queryFn: async () => {
      const { data } = await api.get('/admin/users', { params: { page, limit, search } });
      return data.data;
    },
  });
};

export const useAdminUpdateUserRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, role }: { id: string; role: string }) => {
      const { data } = await api.patch(`/admin/users/${id}/role`, { role });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
};

// Orders
export const useAdminOrders = (page = 1, limit = 20, status = '', search = '') => {
  return useQuery({
    queryKey: ['admin', 'orders', page, limit, status, search],
    queryFn: async () => {
      const { data } = await api.get('/admin/orders', { params: { page, limit, status, search } });
      return data.data;
    },
  });
};

export const useAdminUpdateOrderStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { data } = await api.patch(`/admin/orders/${id}/status`, { status });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] });
    },
  });
};

// Products
export const useAdminProducts = (page = 1, limit = 20, search = '') => {
  return useQuery({
    queryKey: ['admin', 'products', page, limit, search],
    queryFn: async () => {
      const { data } = await api.get('/admin/products', { params: { page, limit, search } });
      return data.data;
    },
  });
};

export const useAdminCreateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (productData: FormData) => {
      const { data } = await api.post('/admin/products', productData);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
    },
  });
};

export const useAdminUpdateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, productData }: { id: string; productData: FormData }) => {
      const { data } = await api.patch(`/admin/products/${id}`, productData);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
    },
  });
};

export const useAdminDeleteProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete(`/admin/products/${id}`);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
    },
  });
};

// Reviews
export const useAdminReviews = (page = 1, limit = 20, status = '') => {
  return useQuery({
    queryKey: ['admin', 'reviews', page, limit, status],
    queryFn: async () => {
      const { data } = await api.get('/admin/reviews', { params: { page, limit, status } });
      return data.data;
    },
  });
};

export const useAdminUpdateReviewStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, isApproved }: { id: string; isApproved: boolean }) => {
      const { data } = await api.patch(`/admin/reviews/${id}/status`, { isApproved });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'reviews'] });
    },
  });
};

// Admin Coupons
export interface AdminCoupon {
  _id: string;
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  maxDiscount?: number;
  minOrderAmount: number;
  expiresAt: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export const useAdminCoupons = () => {
  return useQuery({
    queryKey: ['admin', 'coupons'],
    queryFn: async () => {
      const { data } = await api.get('/coupons/admin/all');
      return (data.data || []) as AdminCoupon[];
    },
  });
};

export const useAdminCreateCoupon = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (couponData: Partial<AdminCoupon>) => {
      const { data } = await api.post('/coupons/admin', couponData);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'coupons'] });
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
    },
  });
};

export const useAdminUpdateCoupon = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data: updateData }: { id: string; data: Partial<AdminCoupon> }) => {
      const { data } = await api.patch(`/coupons/admin/${id}`, updateData);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'coupons'] });
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
    },
  });
};

export const useAdminDeleteCoupon = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete(`/coupons/admin/${id}`);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'coupons'] });
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
    },
  });
};
