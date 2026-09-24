import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCartDrawerStore } from '../store/useCartDrawerStore';
import { api } from '../services/api';
import toast from 'react-hot-toast';

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

const getLocalCart = (): CartData => {
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

const saveLocalCart = (cart: CartData) => {
  try {
    localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(cart));
  } catch (_) {}
};

const calculateTotals = (items: CartItem[]): CartData => {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  return { items, subtotal, total: subtotal };
};

export const useCart = () => {
  return useQuery<CartData>({
    queryKey: ['cart'],
    queryFn: () => getLocalCart(),
    initialData: getLocalCart,
    staleTime: 1000,
  });
};

export const useAddToCart = () => {
  const queryClient = useQueryClient();
  const openDrawer = useCartDrawerStore((state) => state.openDrawer);

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
      toast.success('Added to cart');
      openDrawer();
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to add to cart');
    },
  });
};

export const useUpdateCartItem = () => {
  const queryClient = useQueryClient();

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
      queryClient.setQueryData(['cart'], updatedCart);
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Could not update quantity');
    },
  });
};

export const useRemoveCartItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ productId, variant }: { productId: string; variant?: string }) => {
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
    },
  });
};

export const useClearCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const emptyCart: CartData = { items: [], subtotal: 0, total: 0 };
      saveLocalCart(emptyCart);
      return emptyCart;
    },
    onSuccess: (emptyCart) => {
      queryClient.setQueryData(['cart'], emptyCart);
    },
  });
};
