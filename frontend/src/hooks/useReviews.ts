import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';

export const useReviews = (productId: string, page = 1, limit = 10, sort = 'newest') => {
  return useQuery({
    queryKey: ['reviews', productId, page, limit, sort],
    queryFn: async () => {
      try {
        const { data } = await api.get(`/products/${productId}/reviews`, {
          params: { page, limit, sort },
        });
        const resData = data?.data ?? data ?? {};
        const reviews = Array.isArray(resData) ? resData : (resData.reviews ?? (Array.isArray(data) ? data : []));
        const meta = resData.meta ?? resData.pagination ?? { page, pages: Math.ceil(reviews.length / limit) || 1, total: reviews.length };
        return { reviews, meta };
      } catch (_) {
        return { reviews: [], meta: { page: 1, pages: 1, total: 0 } };
      }
    },
    enabled: !!productId,
    staleTime: 60 * 1000,
    retry: 1,
  });
};

export const useReviewStats = (productId: string) => {
  return useQuery({
    queryKey: ['reviews', 'stats', productId],
    queryFn: async () => {
      const { data } = await api.get(`/products/${productId}/reviews/stats`);
      return data?.data?.stats ?? data?.stats ?? data ?? {};
    },
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
