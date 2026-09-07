import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { DEFAULT_PRODUCTS, DEFAULT_CATEGORIES } from '../data/products';

interface FetchProductsParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
}

export const useProducts = (params: FetchProductsParams) => {
  return useQuery({
    queryKey: ['products', params],
    queryFn: async () => {
      // Clean up undefined params
      const cleanParams = Object.fromEntries(
        Object.entries(params).filter(([_, v]) => v !== undefined && v !== '')
      );

      const { data } = await api.get('/products', { params: cleanParams });
      return {
        products: data.data || data.data?.products || [],
        pagination: data.meta || { total: 0, page: params.page || 1, pages: 1 }
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};

export const useProduct = (slug: string) => {
  return useQuery({
    queryKey: ['product', slug],
    queryFn: async () => {
      try {
        const { data } = await api.get(`/products/${slug}`);
        if (data && (data.data?.product || data.data)) {
          return data.data.product || data.data;
        }
      } catch (err) {
        console.warn(`Backend API not reachable for product ${slug}. Falling back to catalog.`, err);
      }

      const found = DEFAULT_PRODUCTS.find((p) => p.slug === slug || p._id === slug);
      if (found) {
        return found;
      }
      throw new Error('Product not found');
    },
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      try {
        const { data } = await api.get('/categories');
        if (data && data.data && data.data.categories && data.data.categories.length > 0) {
          return data.data.categories;
        }
      } catch (err) {
        console.warn('Backend API not reachable for categories. Serving defaults.', err);
      }
      return DEFAULT_CATEGORIES;
    },
    staleTime: 60 * 60 * 1000,
  });
};
