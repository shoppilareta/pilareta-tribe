'use client';

import { useState } from 'react';
import { useCart } from './CartProvider';
import type { ShopifyProduct, ShopifyProductVariant } from '@/lib/shopify/types';

interface AddToCartButtonProps {
  product: ShopifyProduct;
  variant?: ShopifyProductVariant;
  className?: string;
  showQuantity?: boolean;
}

export function AddToCartButton({
  product,
  variant,
  className = '',
  showQuantity = false,
}: AddToCartButtonProps) {
  const { addToCart, isLoading } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  // Use first available variant if not specified
  const selectedVariant = variant || product.variants.find(v => v.availableForSale) || product.variants[0];

  const isAvailable = selectedVariant?.availableForSale && product.availableForSale;

  const handleAddToCart = async () => {
    if (!selectedVariant || !isAvailable) return;

    setIsAdding(true);
    try {
      await addToCart(product, selectedVariant, quantity);
      setQuantity(1);
    } catch (error) {
      console.error('Failed to add to cart:', error);
    } finally {
      setIsAdding(false);
    }
  };

  if (!isAvailable) {
    return (
      <button
        disabled
        className={`btn-outline opacity-50 cursor-not-allowed ${className}`}
      >
        Sold Out
      </button>
    );
  }

  return (
    <button
      onClick={handleAddToCart}
      disabled={isLoading || isAdding}
      className={`inline-flex items-center justify-center px-4 py-2 text-sm font-medium border border-[rgba(246,237,221,0.8)] rounded-full bg-transparent text-[#f6eddd] hover:bg-[rgba(246,237,221,0.1)] transition-colors disabled:opacity-50 ${className}`}
    >
      {isAdding ? 'Adding...' : 'Add to Cart'}
    </button>
  );
}
