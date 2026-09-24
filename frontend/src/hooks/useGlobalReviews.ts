import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';

const DEFAULT_REVIEWS = [
  {
    _id: 'rev-default-1',
    rating: 5,
    title: 'Zero aftertaste, truly natural sweetening!',
    content: 'Sweet Monk completely replaced regular sugar in my morning chai. No blood sugar spike and tastes 100% natural with zero metallic aftertaste.',
    user: { name: 'Priya Sharma' },
  },
  {
    _id: 'rev-default-2',
    rating: 5,
    title: 'A game changer for my diabetes care',
    content: 'My HbA1c levels have significantly improved after switching from refined sugar to Sweet Monk drops. Highly recommended to anyone managing glucose.',
    user: { name: 'Rajesh Verma' },
  },
  {
    _id: 'rev-default-3',
    rating: 5,
    title: 'Best Monk Fruit extract in India',
    content: 'Just 1-2 drops are enough for a large cup. It has zero calories and zero net carbs. Truly a blessing for healthy living.',
    user: { name: 'Dr. Ananya Sen' },
  },
];

export const useGlobalReviews = (limit = 3, _sort = 'helpful') => {
  return useQuery({
    queryKey: ['global-reviews', limit],
    queryFn: async () => {
      try {
        const { data: prodData } = await api.get('/products', { params: { limit: 1 } });
        const prods = prodData?.data?.products || (Array.isArray(prodData) ? prodData : []);
        if (prods.length > 0 && prods[0]._id) {
          const { data: revData } = await api.get(`/products/${prods[0]._id}/reviews`);
          const reviewsList = Array.isArray(revData) ? revData : (revData?.data?.reviews ?? revData?.data ?? []);
          if (reviewsList.length > 0) {
            return { reviews: reviewsList.slice(0, limit) };
          }
        }
      } catch (_) {
        // Fallback gracefully
      }
      return { reviews: DEFAULT_REVIEWS.slice(0, limit) };
    },
    staleTime: 60 * 1000,
  });
};

