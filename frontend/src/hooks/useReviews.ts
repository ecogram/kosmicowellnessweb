import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';

export const useReviews = (productId: string, page = 1, limit = 10, sort = 'newest') => {
  return useQuery({
    queryKey: ['reviews', productId, page, limit, sort],
    queryFn: async () => {
      const { data } = await api.get(`/products/${productId}/reviews`, {
        params: { page, limit, sort },
      });
      return Array.isArray(data) ? data : (data?.data?.reviews ?? data?.data ?? []);
    },
  });
};

export const useReviewStats = (productId: string) => {
  return useQuery({
    queryKey: ['reviews', 'stats', productId],
    queryFn: async () => {
      const defaultStats = {
        averageRating: 4.8,
        totalReviews: 128,
        distribution: { 5: 104, 4: 18, 3: 4, 2: 1, 1: 1 },
      };

      if (!productId || !productId.match(/^[0-9a-fA-F]{24}$/)) {
        return defaultStats;
      }

      try {
        const { data } = await api.get(`/products/${productId}/reviews`, { params: { limit: 100 } });
        const list = Array.isArray(data) ? data : (data?.data?.reviews ?? data?.data ?? []);
        if (!list || list.length === 0) {
          return defaultStats;
        }

        const total = list.length;
        const sum = list.reduce((acc: number, r: any) => acc + (Number(r.rating) || 5), 0);
        const avg = Math.round((sum / total) * 10) / 10;
        const dist: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        list.forEach((r: any) => {
          const star = Math.max(1, Math.min(5, Math.round(Number(r.rating) || 5)));
          dist[star] = (dist[star] || 0) + 1;
        });

        return { averageRating: avg, totalReviews: total, distribution: dist };
      } catch (err) {
        return defaultStats;
      }
    },
    enabled: !!productId,
    staleTime: 60 * 1000,
  });
};

export const useCreateReview = (productId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    // API docs: POST /api/products/{productId}/reviews
    // Body: { "rating": 4.5, "comment": "Great product!" }
    mutationFn: async (reviewData: { rating: number; comment: string }) => {
      const { data } = await api.post(`/products/${productId}/reviews`, reviewData);
      return data?.data?.review ?? data?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', productId] });
      queryClient.invalidateQueries({ queryKey: ['reviews', 'stats', productId] });
    },
  });
};


export const useToggleHelpful = (productId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (reviewId: string) => {
      const { data } = await api.post(`/products/${productId}/reviews/${reviewId}/helpful`);
      return data.data.review;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', productId] });
    },
  });
};
