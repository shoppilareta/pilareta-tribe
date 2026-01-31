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
