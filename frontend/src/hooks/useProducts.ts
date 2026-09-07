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

      try {
        const { data } = await api.get('/products', { params: cleanParams });
        const fetchedList = data?.data?.products || (Array.isArray(data?.data) ? data.data : []);
        if (Array.isArray(fetchedList) && fetchedList.length > 0) {
          return {
            products: fetchedList,
            pagination: data.meta || { total: fetchedList.length, page: params.page || 1, pages: 1 }
          };
        }
      } catch (err) {
        console.warn('Backend API not reachable for products list. Serving catalog fallback.', err);
      }

      // Filter DEFAULT_PRODUCTS if search/category params applied
      let filtered = [...DEFAULT_PRODUCTS];
      if (params.search) {
        const query = params.search.toLowerCase();
        filtered = filtered.filter(
          (p) => p.name.toLowerCase().includes(query) || (p.description && p.description.toLowerCase().includes(query))
        );
      }
      if (params.category) {
        const cat = params.category;
        filtered = filtered.filter(
          (p) =>
            p.category === cat ||
            (typeof p.category === 'object' && (p.category as any)?.slug === cat) ||
            (typeof p.category === 'object' && (p.category as any)?.name?.toLowerCase() === cat.toLowerCase())
        );
      }

      return {
        products: filtered,
        pagination: { total: filtered.length, page: params.page || 1, pages: 1 }
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
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
