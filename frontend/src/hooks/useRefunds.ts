import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';

// POST /api/refund/initiate
export const useInitiateRefund = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, reason }: { orderId: string; reason: string }) => {
      const { data } = await api.post('/refund/request', { orderId, reason });
      return data?.data ?? data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['refunds'] });
    },
  });
};

export interface RefundItem {
  refundId: string;
  orderNumber: string;
  amount: number;
  status: string;
  reason?: string;
  date: string;
}

export interface ReturnItem {
  returnId: string;
  orderNumber: string;
  status: string;
  reason?: string;
  date: string;
  items?: any[];
}

// GET /api/refund/my-refunds
export const useMyRefunds = () => {
  return useQuery({
    queryKey: ['refunds'],
    queryFn: async () => {
      const { data } = await api.get('/refund/my-refunds');
      const list = data?.data?.refunds ?? (Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []));
      return (Array.isArray(list) ? list : []) as RefundItem[];
    },
    staleTime: 60 * 1000,
    refetchInterval: 10000,
    retry: 1,
  });
};

// POST /api/return/initiate
export const useInitiateReturn = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, reason }: { orderId: string; reason: string }) => {
      const { data } = await api.post('/return/request', { orderId, reason });
      return data?.data ?? data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['returns'] });
    },
  });
};

// GET /api/return/my-returns
export const useMyReturns = () => {
  return useQuery({
    queryKey: ['returns'],
    queryFn: async () => {
      const { data } = await api.get('/return/my-returns');
      const list = data?.data?.returns ?? (Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []));
      return (Array.isArray(list) ? list : []) as ReturnItem[];
    },
    staleTime: 60 * 1000,
    refetchInterval: 10000,
    retry: 1,
  });
};
