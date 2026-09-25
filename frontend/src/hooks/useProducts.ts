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

      let data: any;
      try {
        const res = await api.get('/products/user/list', { params: cleanParams });
        data = res.data;
      } catch (err) {
        // Fallback to /products/bestsellers if /user/list fails on live server
        try {
          const res = await api.get('/products/bestsellers');
          data = res.data;
        } catch {
          data = [];
        }
      }

      let products = Array.isArray(data) ? data : (data?.data?.products ?? (Array.isArray(data?.data) ? data.data : []));

      // Filter by search query locally if fallback was triggered
      if (params.search) {
        const s = params.search.toLowerCase();
        products = products.filter((p: any) =>
          p.name?.toLowerCase().includes(s) ||
          p.description?.toLowerCase().includes(s)
        );
      }

      // Filter: strictly show Monk Fruit / Sweet Monk products
      products = products.filter((p: any) => {
        const str = (p.name || p.title || p.slug || '').toLowerCase();
        return str.includes('sweet monk') || str.includes('monk') || str.includes('sweetener');
      });

      // Normalize images
      products = products.map((p: any) => ({
        ...p,
        image: normalizeImageUrl(p.image),
        images: Array.isArray(p.images) ? p.images.map(normalizeImageUrl) : [],
      }));

      const pagination = data?.pagination ?? data?.data?.pagination ?? data?.meta ?? {
        total: products.length,
        page: params.page ?? 1,
        pages: 1,
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
      let product: any = null;
      const isObjectId = Boolean(slug && /^[0-9a-fA-F]{24}$/.test(slug));

      if (isObjectId) {
        // Direct query by MongoDB ObjectId works without CastError
        try {
          const { data } = await api.get(`/products/${slug}`);
          product = data?.data?.product ?? data?.data ?? data;
        } catch { }
      } else {
        // Safe slug lookup: Query bestsellers / user list without triggering backend CastError 500
        try {
          const { data } = await api.get('/products/bestsellers');
          const list = Array.isArray(data) ? data : (data?.data?.products ?? (Array.isArray(data?.data) ? data.data : []));
          product = list.find((p: any) => p.slug === slug || p._id === slug || p.id === slug);
        } catch { }

        if (!product) {
          try {
            const res = await api.get('/products/user/list', { params: { limit: 50 } });
            const pData = res?.data?.data ?? res?.data ?? {};
            const list = Array.isArray(pData) ? pData : (pData.products ?? []);
            product = list.find((p: any) => p.slug === slug || p._id === slug || p.id === slug);
          } catch { }
        }

        // If found and has a valid ObjectId, fetch fresh detailed record by its real _id (200 OK)
        if (product && product._id && /^[0-9a-fA-F]{24}$/.test(product._id)) {
          try {
            const { data } = await api.get(`/products/${product._id}`);
            const fresh = data?.data?.product ?? data?.data ?? data;
            if (fresh && (fresh.name || fresh._id)) {
              product = { ...product, ...fresh };
            }
          } catch { }
        }
      }

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
        try {
          const { data } = await api.get('/products/categories');
          const categories = Array.isArray(data) ? data : [];
          return categories.map((cat: any, idx: number) => ({
            _id: typeof cat === 'string' ? `cat_${idx}` : cat._id,
            name: typeof cat === 'string' ? cat : cat.name,
            slug: typeof cat === 'string' ? cat.toLowerCase() : cat.slug,
          }));
        } catch {
          return [] as any[];
        }
      }
    },
    staleTime: 60 * 60 * 1000, // 1 hour
    retry: 1,
  });
};
