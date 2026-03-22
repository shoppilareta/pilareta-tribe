import { apiFetch } from './client';
import type { ShopProductsResponse, ShopCartResponse } from '@shared/types';

export async function getProducts(): Promise<ShopProductsResponse> {
  return apiFetch('/api/shopify/products', { skipAuth: true });
}

export async function getCart(cartId: string): Promise<ShopCartResponse> {
  return apiFetch(`/api/shopify/cart?cartId=${cartId}`, { skipAuth: true });
}

export async function addToCart(
  cartId: string | undefined,
  lines: { merchandiseId: string; quantity: number }[]
): Promise<ShopCartResponse> {
  return apiFetch('/api/shopify/cart', {
    method: 'POST',
    body: JSON.stringify({ cartId, lines }),
    skipAuth: true,
  });
}

export async function updateCart(
  cartId: string,
  lines: { id: string; quantity: number }[]
): Promise<ShopCartResponse> {
  return apiFetch('/api/shopify/cart', {
    method: 'PUT',
    body: JSON.stringify({ cartId, lines }),
    skipAuth: true,
  });
}

export async function removeFromCart(
  cartId: string,
  lineIds: string[]
): Promise<ShopCartResponse> {
  return apiFetch('/api/shopify/cart', {
    method: 'DELETE',
    body: JSON.stringify({ cartId, lineIds }),
    skipAuth: true,
  });
}

export async function getWishlist(): Promise<{ handles: string[] }> {
  return apiFetch('/api/wishlist');
}

export async function addToWishlist(handle: string): Promise<{ wishlisted: boolean }> {
  return apiFetch('/api/wishlist', {
    method: 'POST',
    body: JSON.stringify({ handle }),
  });
}

export async function removeFromWishlist(handle: string): Promise<{ wishlisted: boolean }> {
  return apiFetch(`/api/wishlist/${handle}`, { method: 'DELETE' });
}

export async function createRestockAlert(
  email: string,
  productHandle: string,
  variantTitle?: string
): Promise<{ subscribed: boolean }> {
  return apiFetch('/api/restock-alerts', {
    method: 'POST',
    body: JSON.stringify({ email, productHandle, variantTitle }),
    skipAuth: false,
  });
}

export async function applyDiscountApi(
  cartId: string,
  code: string
): Promise<ShopCartResponse> {
  return apiFetch('/api/shopify/cart', {
    method: 'PATCH',
    body: JSON.stringify({ cartId, discountCodes: [code] }),
  });
}
