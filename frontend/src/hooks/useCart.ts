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

// Normalize raw server cart payload into standard CartData structure
export const extractCartData = (payload: any): CartData => {
  if (!payload) return { items: [], subtotal: 0, total: 0 };

  const rawCart = payload.cart || payload.data?.cart || payload.data || payload;
  const rawItems = Array.isArray(rawCart)
    ? rawCart
    : (Array.isArray(rawCart.items) ? rawCart.items : []);

  const items: CartItem[] = rawItems
    .map((it: any) => {
      if (!it) return null;
      const p = it.product || {};
      const productId = String(p._id || p.id || (typeof it.product === 'string' ? it.product : '') || it.productId || '').trim();
      if (!productId) return null;

      const name = p.name || p.title || it.name || 'Kosmico Wellness Product';
      const price = typeof it.priceSnapshot === 'number'
        ? it.priceSnapshot
        : (typeof it.price === 'number'
            ? it.price
            : (typeof p.price === 'number' ? p.price : (Number(p.price) || 0)));

      const images = Array.isArray(p.images) && p.images.length > 0
        ? p.images
        : (p.image ? [p.image] : (it.image ? [it.image] : ['/assets/products/product-box.jpg']));

      return {
        _id: String(it._id || `cart-item-${productId}-${it.variant || ''}`),
        productId,
        product: {
          _id: productId,
          id: productId,
          name,
          title: name,
          price: typeof p.price === 'number' ? p.price : price,
          image: images[0] || p.image || '/assets/products/product-box.jpg',
          images,
          slug: p.slug || productId,
          stock: typeof p.stock === 'number' ? p.stock : it.stock,
        },
        quantity: Math.max(1, Number(it.quantity) || 1),
        price,
        priceSnapshot: price,
        variant: it.variant,
        stock: typeof p.stock === 'number' ? p.stock : it.stock,
      } as CartItem;
    })
    .filter((item: CartItem | null): item is CartItem => item !== null);

  return calculateTotals(items);
};

// GET /api/cart
export const useCart = () => {
  const { isAuthenticated } = useAuthStore();

  return useQuery<CartData>({
    queryKey: ['cart'],
    queryFn: async () => {
      if (!isAuthenticated) {
        return getLocalCart();
      }

      try {
        const res = await api.get('/cart');
        const cartData = extractCartData(res.data);
        saveLocalCart(cartData);
        return cartData;
      } catch (err) {
        console.warn('Backend cart fetch failed, using local cart:', err);
        return getLocalCart();
      }
    },
    initialData: getLocalCart,
    staleTime: 3000,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  });
};

// POST /api/cart/add
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
      // 1. Fetch real stock from database / cache if not provided
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

      // Real Database Stock Validation
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

      // If user is authenticated, sync with backend API (supports both POST /api/cart/add and POST /api/cart)
      if (isAuthenticated) {
        try {
          const res = await api.post('/cart/add', {
            productId,
            quantity,
            variant,
          });
          const serverCart = extractCartData(res.data);
          saveLocalCart(serverCart);
          return serverCart;
        } catch (apiErr: any) {
          // Fallback to /cart if /cart/add returns 404
          if (apiErr?.response?.status === 404) {
            const res = await api.post('/cart', { productId, quantity, variant });
            const serverCart = extractCartData(res.data);
            saveLocalCart(serverCart);
            return serverCart;
          }
          throw apiErr;
        }
      }

      // Guest LocalStorage fallback
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
      queryClient.setQueryData(['cart'], updatedCart);
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast.success('Added to cart');
      openDrawer();
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || err?.message || 'Failed to add to cart';
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

// PUT /api/cart/:productId
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
          const serverCart = extractCartData(res.data);
          saveLocalCart(serverCart);
          return serverCart;
        } catch (apiErr: any) {
          if (apiErr?.response?.status === 404) {
            const res = await api.put(`/cart/update/${productId}`, { quantity, variant });
            const serverCart = extractCartData(res.data);
            saveLocalCart(serverCart);
            return serverCart;
          }
          throw apiErr;
        }
      }

      // Guest fallback
      const currentCart = getLocalCart();
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
      queryClient.setQueryData(['cart'], updatedCart);
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || err?.message || 'Could not update quantity';
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

// DELETE /api/cart/remove/:productId
export const useRemoveCartItem = () => {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuthStore();

  return useMutation({
    mutationFn: async ({ productId, variant }: { productId: string; variant?: string }) => {
      if (isAuthenticated) {
        try {
          const res = await api.delete(`/cart/remove/${productId}`, { data: { variant } });
          const serverCart = extractCartData(res.data);
          saveLocalCart(serverCart);
          return serverCart;
        } catch (apiErr: any) {
          if (apiErr?.response?.status === 404) {
            const res = await api.delete(`/cart/${productId}`, { data: { variant } });
            const serverCart = extractCartData(res.data);
            saveLocalCart(serverCart);
            return serverCart;
          }
          throw apiErr;
        }
      }

      // Guest fallback
      const currentCart = getLocalCart();
      const updatedItems = currentCart.items.filter(
        (it) => !(it.productId === productId && (it.variant ?? '') === (variant ?? ''))
      );

      const updatedCart = calculateTotals(updatedItems);
      saveLocalCart(updatedCart);
      return updatedCart;
    },
    onSuccess: (updatedCart) => {
      queryClient.setQueryData(['cart'], updatedCart);
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
};

// DELETE /api/cart/clear
export const useClearCart = () => {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuthStore();

  return useMutation({
    mutationFn: async () => {
      if (isAuthenticated) {
        try {
          await api.delete('/cart/clear');
        } catch (_) {
          try {
            await api.delete('/cart');
          } catch (_) {}
        }
      }

      const emptyCart: CartData = { items: [], subtotal: 0, total: 0 };
      saveLocalCart(emptyCart);
      return emptyCart;
    },
    onSuccess: (emptyCart) => {
      queryClient.setQueryData(['cart'], emptyCart);
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
};
