import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCartDrawerStore } from '../store/useCartDrawerStore';
import { useAuthStore } from '../store/useAuthStore';
import { api } from '../services/api';
import toast from 'react-hot-toast';
import { showStockToast } from '../utils/stockToast';

export interface CartItem {
  _id: string;
  productId: string;
  product: {
    _id: string;
    id?: string;
    name: string;
    title?: string;
    price: number;
    image?: string;
    images?: string[];
    slug?: string;
    stock?: number;
  };
  quantity: number;
  price: number;
  priceSnapshot?: number;
  variant?: string;
  stock?: number;
}

export interface CartData {
  items: CartItem[];
  subtotal: number;
  total: number;
}

const LOCAL_CART_KEY = 'kosmico_cart_v1';

export const getLocalCart = (): CartData => {
  try {
    const raw = localStorage.getItem(LOCAL_CART_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.items)) {
        return parsed;
      }
    }
  } catch (_) {}
  return { items: [], subtotal: 0, total: 0 };
};

export const saveLocalCart = (cart: CartData) => {
  try {
    localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(cart));
  } catch (_) {}
};

export const calculateTotals = (items: CartItem[]): CartData => {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  return { items, subtotal, total: subtotal };
};

export const mapServerCartToClient = (serverCart: any): CartData => {
  if (!serverCart || !Array.isArray(serverCart.items)) {
    return { items: [], subtotal: 0, total: 0 };
  }

  const items: CartItem[] = serverCart.items
    .filter((item: any) => item && item.product)
    .map((item: any) => {
      const p = item.product;
      const productId = (p._id || p.id || (typeof p === 'string' ? p : '')).toString();
      const name = p.name || p.title || 'Product';
      const price = typeof item.priceSnapshot === 'number'
        ? item.priceSnapshot
        : (typeof p.price === 'number' ? p.price : 0);
      const image = p.image || (Array.isArray(p.images) && p.images.length > 0 ? p.images[0] : undefined);
      const images = Array.isArray(p.images) ? p.images : (image ? [image] : []);
      const slug = p.slug || '';
      const stock = typeof p.stock === 'number' ? p.stock : 0;

      return {
        _id: item._id ? item._id.toString() : `item-${productId}-${item.variant || ''}`,
        productId,
        product: {
          _id: productId,
          id: productId,
          name,
          title: name,
          price,
          image,
          images,
          slug,
          stock,
        },
        quantity: item.quantity || 1,
        price,
        priceSnapshot: price,
        variant: item.variant || undefined,
        stock,
      };
    });

  const subtotal = items.reduce((sum, it) => sum + (it.price * it.quantity), 0);
  return { items, subtotal, total: subtotal };
};

export const useCart = () => {
  const { isAuthenticated } = useAuthStore();

  return useQuery<CartData>({
    queryKey: ['cart', isAuthenticated],
    queryFn: async () => {
      if (!isAuthenticated) {
        return getLocalCart();
      }

      try {
        // Sync any guest items to server upon login
        const localCart = getLocalCart();
        if (localCart.items && localCart.items.length > 0) {
          for (const it of localCart.items) {
            try {
              await api.post('/cart', {
                productId: it.productId,
                quantity: it.quantity,
                variant: it.variant,
              });
            } catch (_) {}
          }
          localStorage.removeItem(LOCAL_CART_KEY);
        }

        const response = await api.get('/cart');
        const rawCart = response.data?.data?.cart ?? response.data?.cart ?? response.data;
        const mapped = mapServerCartToClient(rawCart);
        saveLocalCart(mapped);
        return mapped;
      } catch (err) {
        return getLocalCart();
      }
    },
    initialData: getLocalCart,
    staleTime: 1000,
    refetchOnWindowFocus: true,
  });
};

export const useAddToCart = () => {
  const queryClient = useQueryClient();
  const openDrawer = useCartDrawerStore((state) => state.openDrawer);
  const { isAuthenticated } = useAuthStore();

  return useMutation({
    mutationFn: async ({
      productId,
      quantity = 1,
      variant,
      name,
      price,
      image,
      images,
      slug,
      stock,
    }: {
      productId: string;
      quantity: number;
      variant?: string;
      name: string;
      price: number;
      image?: string;
      images?: string[];
      slug?: string;
      stock?: number;
    }) => {
      // 1. Authenticated flow -> save to MongoDB Database
      if (isAuthenticated) {
        try {
          const res = await api.post('/cart', {
            productId,
            quantity,
            variant,
          });
          const rawCart = res.data?.data?.cart ?? res.data?.cart ?? res.data;
          const mapped = mapServerCartToClient(rawCart);
          saveLocalCart(mapped);
          return mapped;
        } catch (apiErr: any) {
          const msg = apiErr?.response?.data?.message || apiErr?.message;
          throw new Error(msg || 'Failed to add to cart');
        }
      }

      // 2. Guest fallback -> save to browser LocalStorage
      let availableStock = stock;
      if (availableStock === undefined) {
        try {
          const cachedProducts: any = queryClient.getQueryData(['products']);
          const prodList = cachedProducts?.products || (Array.isArray(cachedProducts) ? cachedProducts : []);
          const match = prodList.find((p: any) => (p._id || p.id) === productId || (slug && p.slug === slug));
          if (match && typeof match.stock === 'number') {
            availableStock = match.stock;
          } else {
            const res = await api.get(`/products/${productId}`);
            const pData = res.data?.data?.product ?? res.data?.data ?? res.data;
            if (pData && typeof pData.stock === 'number') {
              availableStock = pData.stock;
            }
          }
        } catch (_) {}
      }

      const currentCart = getLocalCart();
      const existingIdx = currentCart.items.findIndex(
        (it) => it.productId === productId && (it.variant ?? '') === (variant ?? '')
      );

      const existingQty = existingIdx > -1 ? currentCart.items[existingIdx].quantity : 0;
      const requestedTotalQty = existingQty + quantity;

      if (typeof availableStock === 'number') {
        if (availableStock <= 0) {
          throw new Error('This product is currently out of stock.');
        }
        if (requestedTotalQty > availableStock) {
          if (existingQty > 0) {
            throw new Error(`Only ${availableStock} items in stock. You already have ${existingQty} in your cart.`);
          } else {
            throw new Error(`Only ${availableStock} items available in stock.`);
          }
        }
      }

      let updatedItems = [...currentCart.items];

      if (existingIdx > -1) {
        updatedItems[existingIdx] = {
          ...updatedItems[existingIdx],
          quantity: requestedTotalQty,
          stock: availableStock ?? updatedItems[existingIdx].stock,
        };
      } else {
        const newItem: CartItem = {
          _id: `cart-item-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          productId,
          product: {
            _id: productId,
            id: productId,
            name,
            title: name,
            price,
            image: image ?? images?.[0],
            images: images ?? (image ? [image] : []),
            slug,
            stock: availableStock,
          },
          quantity,
          price,
          priceSnapshot: price,
          variant,
          stock: availableStock,
        };
        updatedItems = [newItem, ...updatedItems];
      }

      const updatedCart = calculateTotals(updatedItems);
      saveLocalCart(updatedCart);
      return updatedCart;
    },
    onSuccess: (updatedCart) => {
      queryClient.setQueryData(['cart', isAuthenticated], updatedCart);
      queryClient.setQueryData(['cart', true], updatedCart);
      queryClient.setQueryData(['cart', false], updatedCart);
      queryClient.setQueryData(['cart'], updatedCart);
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast.success('Added to cart');
      openDrawer();
    },
    onError: (err: any) => {
      const msg = err?.message || 'Failed to add to cart';
      if (msg.includes('available in stock') || msg.includes('items in stock') || msg.includes('out of stock')) {
        const match = msg.match(/\d+/);
        const stockNum = match ? parseInt(match[0], 10) : 0;
        showStockToast(stockNum);
      } else {
        toast.error(msg);
      }
    },
  });
};

export const useUpdateCartItem = () => {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuthStore();

  return useMutation({
    mutationFn: async ({
      productId,
      quantity,
      variant,
    }: {
      productId: string;
      quantity: number;
      variant?: string;
    }) => {
      if (isAuthenticated) {
        try {
          const res = await api.put(`/cart/${productId}`, {
            quantity,
            variant,
          });
          const rawCart = res.data?.data?.cart ?? res.data?.cart ?? res.data;
          const mapped = mapServerCartToClient(rawCart);
          saveLocalCart(mapped);
          return mapped;
        } catch (apiErr: any) {
          const msg = apiErr?.response?.data?.message || apiErr?.message;
          throw new Error(msg || 'Could not update quantity');
        }
      }

      const currentCart = getLocalCart();
      const existing = currentCart.items.find(
        (it) => it.productId === productId && (it.variant ?? '') === (variant ?? '')
      );

      if (existing) {
        const availableStock = existing.stock ?? existing.product?.stock;
        if (typeof availableStock === 'number') {
          if (availableStock <= 0) {
            throw new Error('This product is currently out of stock.');
          }
          if (quantity > availableStock) {
            throw new Error(`Only ${availableStock} items available in stock.`);
          }
        }
      }

      const updatedItems = currentCart.items
        .map((it) => {
          if (it.productId === productId && (it.variant ?? '') === (variant ?? '')) {
            return { ...it, quantity: Math.max(1, quantity) };
          }
          return it;
        })
        .filter((it) => it.quantity > 0);

      const updatedCart = calculateTotals(updatedItems);
      saveLocalCart(updatedCart);
      return updatedCart;
    },
    onSuccess: (updatedCart) => {
      queryClient.setQueryData(['cart', isAuthenticated], updatedCart);
      queryClient.setQueryData(['cart', true], updatedCart);
      queryClient.setQueryData(['cart', false], updatedCart);
      queryClient.setQueryData(['cart'], updatedCart);
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
    onError: (err: any) => {
      const msg = err?.message || 'Could not update quantity';
      if (msg.includes('available in stock') || msg.includes('items in stock') || msg.includes('out of stock')) {
        const match = msg.match(/\d+/);
        const stockNum = match ? parseInt(match[0], 10) : 0;
        showStockToast(stockNum);
      } else {
        toast.error(msg);
      }
    },
  });
};

export const useRemoveCartItem = () => {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuthStore();

  return useMutation({
    mutationFn: async ({ productId, variant }: { productId: string; variant?: string }) => {
      if (isAuthenticated) {
        try {
          const res = await api.delete(`/cart/${productId}`, {
            data: { variant },
            params: { variant },
          });
          const rawCart = res.data?.data?.cart ?? res.data?.cart ?? res.data;
          const mapped = mapServerCartToClient(rawCart);
          saveLocalCart(mapped);
          return mapped;
        } catch (apiErr: any) {
          const msg = apiErr?.response?.data?.message || apiErr?.message;
          throw new Error(msg || 'Could not remove item');
        }
      }

      const currentCart = getLocalCart();
      const updatedItems = currentCart.items.filter(
        (it) => !(it.productId === productId && (it.variant ?? '') === (variant ?? ''))
      );

      const updatedCart = calculateTotals(updatedItems);
      saveLocalCart(updatedCart);
      return updatedCart;
    },
    onSuccess: (updatedCart) => {
      queryClient.setQueryData(['cart', isAuthenticated], updatedCart);
      queryClient.setQueryData(['cart', true], updatedCart);
      queryClient.setQueryData(['cart', false], updatedCart);
      queryClient.setQueryData(['cart'], updatedCart);
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
};

export const useClearCart = () => {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuthStore();

  return useMutation({
    mutationFn: async () => {
      if (isAuthenticated) {
        try {
          await api.delete('/cart');
        } catch (_) {}
      }
      const emptyCart: CartData = { items: [], subtotal: 0, total: 0 };
      saveLocalCart(emptyCart);
      return emptyCart;
    },
    onSuccess: (emptyCart) => {
      queryClient.setQueryData(['cart', isAuthenticated], emptyCart);
      queryClient.setQueryData(['cart', true], emptyCart);
      queryClient.setQueryData(['cart', false], emptyCart);
      queryClient.setQueryData(['cart'], emptyCart);
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
};
