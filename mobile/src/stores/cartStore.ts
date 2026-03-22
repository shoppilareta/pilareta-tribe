import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { getCart, addToCart, updateCart, removeFromCart, applyDiscountApi } from '@/api/shop';

interface CartLine {
  id: string;
  quantity: number;
  merchandise: {
    id: string;
    title: string;
    image?: { url: string; altText?: string | null };
    product: { title: string; handle: string };
    price: { amount: string; currencyCode: string };
  };
}

interface CartState {
  cartId: string | null;
  lines: CartLine[];
  checkoutUrl: string | null;
  totalAmount: string | null;
  subtotalAmount: string | null;
  taxAmount: string | null;
  currencyCode: string;
  loading: boolean;
  cartExpired: boolean;
  discountCode: string | null;
  discountAmount: string | null;

  loadCart: () => Promise<void>;
  addItem: (merchandiseId: string, quantity?: number) => Promise<void>;
  updateQuantity: (lineId: string, quantity: number) => Promise<void>;
  removeItem: (lineId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  clearExpired: () => void;
  totalItems: () => number;
  applyDiscount: (code: string) => Promise<void>;
  removeDiscount: () => Promise<void>;
}

const CART_ID_KEY = 'pilareta_cart_id';

export const useCartStore = create<CartState>((set, get) => ({
  cartId: null,
  lines: [],
  checkoutUrl: null,
  totalAmount: null,
  subtotalAmount: null,
  taxAmount: null,
  currencyCode: 'INR',
  loading: false,
  cartExpired: false,
  discountCode: null,
  discountAmount: null,

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
        subtotalAmount: cart.cost.subtotalAmount.amount,
        taxAmount: cart.cost.totalTaxAmount?.amount ?? null,
        currencyCode: cart.cost.totalAmount.currencyCode,
        discountCode: cart.discountCodes?.[0]?.code || null,
        discountAmount: cart.discountAllocations?.[0]?.discountedAmount?.amount || null,
        loading: false,
      });
    } catch {
      // Cart may have expired
      await SecureStore.deleteItemAsync(CART_ID_KEY);
      set({ cartId: null, lines: [], checkoutUrl: null, totalAmount: null, subtotalAmount: null, taxAmount: null, discountCode: null, discountAmount: null, loading: false, cartExpired: true });
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
        subtotalAmount: cart.cost.subtotalAmount.amount,
        taxAmount: cart.cost.totalTaxAmount?.amount ?? null,
        currencyCode: cart.cost.totalAmount.currencyCode,
        discountCode: cart.discountCodes?.[0]?.code || null,
        discountAmount: cart.discountAllocations?.[0]?.discountedAmount?.amount || null,
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
        subtotalAmount: cart.cost.subtotalAmount.amount,
        taxAmount: cart.cost.totalTaxAmount?.amount ?? null,
        currencyCode: cart.cost.totalAmount.currencyCode,
        discountCode: cart.discountCodes?.[0]?.code || null,
        discountAmount: cart.discountAllocations?.[0]?.discountedAmount?.amount || null,
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
        subtotalAmount: cart.cost.subtotalAmount.amount,
        taxAmount: cart.cost.totalTaxAmount?.amount ?? null,
        currencyCode: cart.cost.totalAmount.currencyCode,
        discountCode: cart.discountCodes?.[0]?.code || null,
        discountAmount: cart.discountAllocations?.[0]?.discountedAmount?.amount || null,
        loading: false,
      });
    } catch {
      set({ loading: false });
    }
  },

  clearCart: async () => {
    await SecureStore.deleteItemAsync(CART_ID_KEY);
    set({ cartId: null, lines: [], checkoutUrl: null, totalAmount: null, subtotalAmount: null, taxAmount: null, discountCode: null, discountAmount: null });
  },

  clearExpired: () => {
    set({ cartExpired: false });
  },

  totalItems: () => {
    return get().lines.reduce((sum, line) => sum + line.quantity, 0);
  },

  applyDiscount: async (code: string) => {
    const { cartId } = get();
    if (!cartId) return;
    set({ loading: true });
    try {
      const { cart } = await applyDiscountApi(cartId, code);
      set({
        lines: cart.lines,
        totalAmount: cart.cost.totalAmount.amount,
        subtotalAmount: cart.cost.subtotalAmount.amount,
        taxAmount: cart.cost.totalTaxAmount?.amount ?? null,
        discountCode: cart.discountCodes?.[0]?.code || null,
        discountAmount: cart.discountAllocations?.[0]?.discountedAmount?.amount || null,
        loading: false,
      });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  removeDiscount: async () => {
    const { cartId } = get();
    if (!cartId) return;
    set({ loading: true });
    try {
      const { cart } = await applyDiscountApi(cartId, '');
      set({
        lines: cart.lines,
        totalAmount: cart.cost.totalAmount.amount,
        subtotalAmount: cart.cost.subtotalAmount.amount,
        taxAmount: cart.cost.totalTaxAmount?.amount ?? null,
        discountCode: null,
        discountAmount: null,
        loading: false,
      });
    } catch {
      set({ loading: false });
    }
  },
}));
