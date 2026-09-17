import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCartDrawerStore } from '../store/useCartDrawerStore';

// Cart is localStorage-based (no /api/cart endpoint in API docs)
// All product data (name, price, image) MUST be passed in from the caller — no hardcoded defaults

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
  };
  quantity: number;
  price: number;
  priceSnapshot?: number;
  variant?: string;
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
    }: {
      productId: string;
      quantity: number;
      variant?: string;
      name: string;       // Required — caller must provide real product name
      price: number;      // Required — caller must provide real product price
      image?: string;
      images?: string[];
      slug?: string;
    }) => {
      const currentCart = getLocalCart();
      const existingIdx = currentCart.items.findIndex(
        (it) => it.productId === productId && (it.variant ?? '') === (variant ?? '')
      );

      let updatedItems = [...currentCart.items];

      if (existingIdx > -1) {
        updatedItems[existingIdx] = {
          ...updatedItems[existingIdx],
          quantity: updatedItems[existingIdx].quantity + quantity,
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
          },
          quantity,
          price,
          priceSnapshot: price,
          variant,
        };
        updatedItems = [newItem, ...updatedItems];
      }

      const updatedCart = calculateTotals(updatedItems);
      saveLocalCart(updatedCart);
      return updatedCart;
    },
    onSuccess: (updatedCart) => {
      queryClient.setQueryData(['cart'], updatedCart);
      openDrawer();
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
