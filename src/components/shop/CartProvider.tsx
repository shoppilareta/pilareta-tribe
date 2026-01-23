'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import type { ShopifyCart, ShopifyProduct, ShopifyProductVariant } from '@/lib/shopify/types';

interface CartContextType {
  cart: ShopifyCart | null;
  isLoading: boolean;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addToCart: (product: ShopifyProduct, variant: ShopifyProductVariant, quantity?: number) => Promise<void>;
  updateQuantity: (lineId: string, quantity: number) => Promise<void>;
  removeItem: (lineId: string) => Promise<void>;
  totalQuantity: number;
}

const CartContext = createContext<CartContextType | null>(null);

const CART_ID_KEY = 'pilareta-cart-id';

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<ShopifyCart | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCartId = localStorage.getItem(CART_ID_KEY);
    if (savedCartId) {
      fetchCart(savedCartId);
    }
  }, []);

  const fetchCart = async (cartId: string) => {
    try {
      const response = await fetch(`/api/shopify/cart?cartId=${encodeURIComponent(cartId)}`);
      if (response.ok) {
        const data = await response.json();
        if (data.cart) {
          setCart(data.cart);
        } else {
          // Cart not found, clear localStorage
          localStorage.removeItem(CART_ID_KEY);
        }
      } else if (response.status === 404) {
        // Cart expired or not found
        localStorage.removeItem(CART_ID_KEY);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
    }
  };

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const addToCart = useCallback(async (
    product: ShopifyProduct,
    variant: ShopifyProductVariant,
    quantity: number = 1
  ) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/shopify/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cartId: cart?.id,
          lines: [{
            merchandiseId: variant.id,
            quantity,
          }],
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add to cart');
      }

      const data = await response.json();
      setCart(data.cart);
      localStorage.setItem(CART_ID_KEY, data.cart.id);
      setIsOpen(true); // Open cart drawer after adding
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [cart?.id]);

  const updateQuantity = useCallback(async (lineId: string, quantity: number) => {
    if (!cart) return;

    setIsLoading(true);
    try {
      if (quantity === 0) {
        // Remove item if quantity is 0
        await removeItem(lineId);
        return;
      }

      const response = await fetch('/api/shopify/cart', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cartId: cart.id,
          lines: [{ id: lineId, quantity }],
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update cart');
      }

      const data = await response.json();
      setCart(data.cart);
    } catch (error) {
      console.error('Error updating cart:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [cart]);

  const removeItem = useCallback(async (lineId: string) => {
    if (!cart) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/shopify/cart', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cartId: cart.id,
          lineIds: [lineId],
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to remove from cart');
      }

      const data = await response.json();
      setCart(data.cart);

      // Clear cart ID if empty
      if (data.cart.totalQuantity === 0) {
        localStorage.removeItem(CART_ID_KEY);
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [cart]);

  const totalQuantity = cart?.totalQuantity || 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        isLoading,
        isOpen,
        openCart,
        closeCart,
        addToCart,
        updateQuantity,
        removeItem,
        totalQuantity,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
