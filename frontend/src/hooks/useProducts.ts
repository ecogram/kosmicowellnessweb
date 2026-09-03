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
        if (data && data.data && data.data.length > 0) {
          return {
            products: data.data,
            pagination: data.meta || { total: data.data.length, page: params.page || 1, pages: 1 }
          };
        }
      } catch (err) {
        console.warn('Backend API not reachable or empty. Serving curated catalog.', err);
      }

      // Fallback: Local catalog with full search, filter & sort capabilities
      let filtered = [...DEFAULT_PRODUCTS];

      if (params.search) {
        const q = params.search.toLowerCase();
        filtered = filtered.filter(
          (p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
        );
      }

      if (params.category) {
        filtered = filtered.filter((p) => {
          if (typeof p.category === 'object' && p.category !== null) {
            return p.category._id === params.category || p.category.slug === params.category;
          }
          return p.category === params.category;
        });
      }

      if (params.sort) {
        if (params.sort === 'price') {
          filtered.sort((a, b) => a.price - b.price);
        } else if (params.sort === '-price') {
          filtered.sort((a, b) => b.price - a.price);
        } else if (params.sort === '-rating') {
          filtered.sort((a, b) => b.rating - a.rating);
        }
      }

      const page = params.page || 1;
      const limit = params.limit || 12;
      const startIndex = (page - 1) * limit;
      const paginatedProducts = filtered.slice(startIndex, startIndex + limit);

      return {
        products: paginatedProducts,
        pagination: {
          total: filtered.length,
          page,
          pages: Math.max(1, Math.ceil(filtered.length / limit)),
        },
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
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
