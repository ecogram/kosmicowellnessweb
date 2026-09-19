import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { normalizeImageUrl } from '../utils/imageUrl';

export interface FetchProductsParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  sortBy?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
}

export const useProducts = (params: FetchProductsParams) => {
  return useQuery({
    queryKey: ['products', params],
    queryFn: async () => {
      // Remove undefined/empty params before sending
      const cleanParams = Object.fromEntries(
        Object.entries(params).filter(([_, v]) => v !== undefined && v !== '')
      );

      const { data } = await api.get('/products/user/list', { params: cleanParams });
      let products = Array.isArray(data) ? data : (data?.data?.products ?? (Array.isArray(data?.data) ? data.data : []));

      // Normalize images
      products = products.map((p: any) => ({
        ...p,
        image: normalizeImageUrl(p.image),
        images: Array.isArray(p.images) ? p.images.map(normalizeImageUrl) : [],
      }));

      const pagination = data?.pagination ?? data?.data?.pagination ?? data?.meta ?? {
        total: products.length,
        page: params.page ?? 1,
        pages: Math.ceil(products.length / (params.limit || 12)) || 1,
      };

      return { products, pagination };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
};

export const useProduct = (slug: string) => {
  return useQuery({
    queryKey: ['product', slug],
    queryFn: async () => {
      const { data } = await api.get(`/products/${slug}`);
      const product = data?.data?.product ?? data?.data ?? data;
      if (!product || (!product.name && !product._id && !product.id)) {
        throw new Error('Product not found');
      }
      
      product.image = normalizeImageUrl(product.image);
      if (Array.isArray(product.images)) {
        product.images = product.images.map(normalizeImageUrl);
      }
      
      return product;
    },
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
};

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      try {
        const { data } = await api.get('/categories/user/list');
        let categories = (Array.isArray(data) ? data : (data?.data?.categories ?? data?.data ?? [])) as any[];
        return categories.map(c => ({
          ...c,
          image: normalizeImageUrl(c.image),
        }));
      } catch {
        // Return empty list — no fake fallback categories
        return [] as any[];
      }
    },
    staleTime: 60 * 60 * 1000, // 1 hour
    retry: 1,
  });
};
