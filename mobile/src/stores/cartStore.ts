import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { getCart, addToCart, updateCart, removeFromCart } from '@/api/shop';

interface CartLine {
  id: string;
  quantity: number;
  merchandise: {
    id: string;
    title: string;
    product: { title: string; images: { url: string }[] };
    price: { amount: string; currencyCode: string };
  };
}

interface CartState {
  cartId: string | null;
  lines: CartLine[];
  checkoutUrl: string | null;
  totalAmount: string | null;
  currencyCode: string;
  loading: boolean;

  loadCart: () => Promise<void>;
  addItem: (merchandiseId: string, quantity?: number) => Promise<void>;
  updateQuantity: (lineId: string, quantity: number) => Promise<void>;
  removeItem: (lineId: string) => Promise<void>;
  clearCart: () => void;
  totalItems: () => number;
}

const CART_ID_KEY = 'pilareta_cart_id';

export const useCartStore = create<CartState>((set, get) => ({
  cartId: null,
  lines: [],
  checkoutUrl: null,
  totalAmount: null,
  currencyCode: 'INR',
  loading: false,

  loadCart: async () => {
    const storedCartId = await SecureStore.getItemAsync(CART_ID_KEY);
    if (!storedCartId) return;

    set({ loading: true });
    try {
      const { cart } = await getCart(storedCartId);
      set({
        cartId: cart.id,
        lines: cart.lines,
        checkoutUrl: cart.checkoutUrl,
        totalAmount: cart.cost.totalAmount.amount,
        currencyCode: cart.cost.totalAmount.currencyCode,
        loading: false,
      });
    } catch {
      // Cart may have expired
      await SecureStore.deleteItemAsync(CART_ID_KEY);
      set({ cartId: null, lines: [], checkoutUrl: null, totalAmount: null, loading: false });
    }
  },

  addItem: async (merchandiseId, quantity = 1) => {
    set({ loading: true });
    try {
      const { cartId } = get();
      const { cart } = await addToCart(cartId || undefined, [{ merchandiseId, quantity }]);
      await SecureStore.setItemAsync(CART_ID_KEY, cart.id);
      set({
        cartId: cart.id,
        lines: cart.lines,
        checkoutUrl: cart.checkoutUrl,
        totalAmount: cart.cost.totalAmount.amount,
        currencyCode: cart.cost.totalAmount.currencyCode,
        loading: false,
      });
    } catch {
      set({ loading: false });
      throw new Error('Failed to add item to cart');
    }
  },

  updateQuantity: async (lineId, quantity) => {
    const { cartId } = get();
    if (!cartId) return;

    if (quantity <= 0) {
      return get().removeItem(lineId);
    }

    set({ loading: true });
    try {
      const { cart } = await updateCart(cartId, [{ id: lineId, quantity }]);
      set({
        lines: cart.lines,
        checkoutUrl: cart.checkoutUrl,
        totalAmount: cart.cost.totalAmount.amount,
        currencyCode: cart.cost.totalAmount.currencyCode,
        loading: false,
      });
    } catch {
      set({ loading: false });
    }
  },

  removeItem: async (lineId) => {
    const { cartId } = get();
    if (!cartId) return;

    set({ loading: true });
    try {
      const { cart } = await removeFromCart(cartId, [lineId]);
      set({
        lines: cart.lines,
        checkoutUrl: cart.checkoutUrl,
        totalAmount: cart.cost.totalAmount.amount,
        currencyCode: cart.cost.totalAmount.currencyCode,
        loading: false,
      });
    } catch {
      set({ loading: false });
    }
  },

  clearCart: () => {
    SecureStore.deleteItemAsync(CART_ID_KEY);
    set({ cartId: null, lines: [], checkoutUrl: null, totalAmount: null });
  },

  totalItems: () => {
    return get().lines.reduce((sum, line) => sum + line.quantity, 0);
  },
}));
