import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';

export interface CouponItem {
  _id: string;
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  maxDiscount?: number;
  minOrderAmount: number;
  expiresAt: string;
  isActive: boolean;
}

export const useCoupons = () => {
  return useQuery({
    queryKey: ['coupons'],
    queryFn: async () => {
      try {
        const { data } = await api.get('/coupons');
        const list = Array.isArray(data?.data) ? data.data : (data?.data?.coupons || []);
        return list as CouponItem[];
      } catch (err) {
        console.warn('Coupons fetch notice:', err);
        return [] as CouponItem[];
      }
    },
    staleTime: 60 * 1000,
  });
};
