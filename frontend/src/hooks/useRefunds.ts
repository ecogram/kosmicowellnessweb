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

// GET /api/refund/my-refunds
export const useMyRefunds = () => {
  return useQuery({
    queryKey: ['refunds'],
    queryFn: async () => {
      const { data } = await api.get('/refund/my-refunds');
      return data?.data?.refunds ?? (Array.isArray(data?.data) ? data.data : []);
    },
    staleTime: 60 * 1000,
    refetchInterval: 5000,
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
      return data?.data?.returns ?? (Array.isArray(data?.data) ? data.data : []);
    },
    staleTime: 60 * 1000,
    refetchInterval: 5000,
    retry: 1,
  });
};
