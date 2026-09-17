import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';

export const useGlobalReviews = (limit = 3, sort = 'helpful') => {
  return useQuery({
    queryKey: ['global-reviews', limit, sort],
    queryFn: async () => {
      const { data } = await api.get('/reviews', { params: { limit, sort } });
      return Array.isArray(data) ? data : (data?.data?.reviews ?? data?.data ?? []);
    },
  });
};
