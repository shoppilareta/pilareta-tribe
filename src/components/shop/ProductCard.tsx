'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { ShopifyProduct } from '@/lib/shopify/types';
import { getColorCode } from '@/lib/colorCode';
import { ProductQuickView } from './ProductQuickView';
import { useWishlist } from './WishlistProvider';

interface ProductCardProps {
  product: ShopifyProduct;
}

function formatPrice(amount: string, currencyCode: string): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currencyCode,
  }).format(parseFloat(amount));
}

export function ProductCard({ product }: ProductCardProps) {
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const { wishlistedHandles, isAuthenticated, toggleWishlist } = useWishlist();
  const { minVariantPrice, maxVariantPrice } = product.priceRange;
  const hasMultiplePrices = minVariantPrice.amount !== maxVariantPrice.amount;

  const isWishlisted = wishlistedHandles.has(product.handle);

  // Sale detection: check if any variant has a compareAtPrice higher than the sale price
  const saleInfo = (() => {
    for (const v of product.variants) {
      if (v.compareAtPrice && parseFloat(v.compareAtPrice.amount) > parseFloat(v.price.amount)) {
        const compareAt = parseFloat(v.compareAtPrice.amount);
        const salePrice = parseFloat(v.price.amount);
        const savePercent = Math.round(((compareAt - salePrice) / compareAt) * 100);
        return {
          isOnSale: true,
          compareAtPrice: v.compareAtPrice,
          salePrice: v.price,
          savePercent,
        };
      }
    }
    return { isOnSale: false } as const;
  })();

  // Low stock detection: check if any available variant has quantity < 5
  const lowStockInfo = (() => {
    if (!product.availableForSale) return null;
    const availableVariants = product.variants.filter(v => v.availableForSale);
    // Find the minimum quantityAvailable across variants that have it defined
    let minQty: number | null = null;
    for (const v of availableVariants) {
      if (v.quantityAvailable !== undefined && v.quantityAvailable !== null) {
        if (minQty === null || v.quantityAvailable < minQty) {
          minQty = v.quantityAvailable;
        }
      }
    }
    if (minQty !== null && minQty > 0 && minQty < 5) {
      return minQty;
    }
    return null;
  })();

  // Extract unique colors with variant image URLs for swatches
  const colorSwatches = (() => {
    const seen = new Map<string, string | undefined>();
    for (const v of product.variants) {
      for (const opt of v.selectedOptions) {
        const isColor = opt.name.toLowerCase() === 'color' || opt.name.toLowerCase() === 'colour';
        if (isColor && !seen.has(opt.value)) {
          seen.set(opt.value, v.image?.url);
        }
      }
    }
    return Array.from(seen.entries()).map(([name, imageUrl]) => ({ name, imageUrl }));
  })();

  // Extract unique sizes from variants
  const sizes = Array.from(new Set(
    product.variants
      .flatMap(v => v.selectedOptions)
      .filter(opt => opt.name.toLowerCase() === 'size')
      .map(opt => opt.value)
  ));

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      // Redirect to login
      window.location.href = '/api/auth/login';
      return;
    }
    toggleWishlist(product.handle);
  };

  return (
    <>
      <div
        onClick={() => setIsQuickViewOpen(true)}
        className="card cursor-pointer group"
      >
        {/* Product Image */}
        <div className="relative aspect-square mb-5 bg-[rgba(246,237,221,0.05)] rounded-lg overflow-hidden">
          {product.featuredImage ? (
            <Image
              src={product.featuredImage.url}
              alt={product.featuredImage.altText || product.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center opacity-20">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}

          {/* Top-left badges: Sold Out / Sale / Low Stock */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {!product.availableForSale && (
              <div
                style={{
                  background: 'rgba(32, 34, 25, 0.9)',
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  padding: '0.3rem 0.65rem',
                  borderRadius: '9999px',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                }}
              >
                Sold Out
              </div>
            )}
            {saleInfo.isOnSale && product.availableForSale && (
              <div
                style={{
                  background: 'rgba(220, 38, 38, 0.9)',
                  color: '#fff',
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  padding: '0.3rem 0.65rem',
                  borderRadius: '9999px',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                }}
              >
                Sale
              </div>
            )}
            {lowStockInfo !== null && (
              <div
                style={{
                  background: 'rgba(217, 119, 6, 0.9)',
                  color: '#fff',
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  padding: '0.3rem 0.65rem',
                  borderRadius: '9999px',
                  letterSpacing: '0.04em',
                }}
              >
                Only {lowStockInfo} left!
              </div>
            )}
          </div>

          {/* Wishlist Heart Icon — top-right */}
          <button
            onClick={handleWishlistClick}
            className="absolute top-3 right-3 w-9 h-9 flex items-center justify-center rounded-full transition-all"
            style={{
              background: 'rgba(32, 34, 25, 0.7)',
              backdropFilter: 'blur(4px)',
            }}
            aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <svg
              className="w-[18px] h-[18px]"
              viewBox="0 0 24 24"
              fill={isWishlisted ? '#ef4444' : 'none'}
              stroke={isWishlisted ? '#ef4444' : 'rgba(246, 237, 221, 0.7)'}
              strokeWidth={1.8}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"
              />
            </svg>
          </button>

          {/* Image Count Badge */}
          {product.images.length > 1 && (
            <div className="absolute bottom-3 right-3 bg-[#202219]/90 text-xs px-2.5 py-1.5 rounded-full flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {product.images.length}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-3">
          <h3 className="font-medium leading-snug line-clamp-2">
            {product.title}
          </h3>

          {/* Price with sale display */}
          <div className="text-sm">
            {saleInfo.isOnSale ? (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold" style={{ color: '#ef4444' }}>
                  {formatPrice(saleInfo.salePrice.amount, saleInfo.salePrice.currencyCode)}
                </span>
                <span className="line-through opacity-40">
                  {formatPrice(saleInfo.compareAtPrice.amount, saleInfo.compareAtPrice.currencyCode)}
                </span>
                <span
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    color: '#ef4444',
                    background: 'rgba(239, 68, 68, 0.1)',
                    padding: '0.15rem 0.5rem',
                    borderRadius: '9999px',
                  }}
                >
                  Save {saleInfo.savePercent}%
                </span>
              </div>
            ) : (
              <p className="opacity-60">
                {hasMultiplePrices ? (
                  <>From {formatPrice(minVariantPrice.amount, minVariantPrice.currencyCode)}</>
                ) : (
                  formatPrice(minVariantPrice.amount, minVariantPrice.currencyCode)
                )}
              </p>
            )}
          </div>

          {/* Color Swatches */}
          {colorSwatches.length > 0 && (
            <div className="flex items-center gap-2 pt-1">
              {colorSwatches.slice(0, 6).map(s => (
                s.imageUrl ? (
                  <img
                    key={s.name}
                    src={s.imageUrl}
                    alt={s.name}
                    title={s.name}
                    className="w-6 h-6 rounded-full border border-[rgba(246,237,221,0.2)] object-cover"
                  />
                ) : (
                  <div
                    key={s.name}
                    className="w-6 h-6 rounded-full border border-[rgba(246,237,221,0.2)]"
                    style={{ backgroundColor: getColorCode(s.name) }}
                    title={s.name}
                  />
                )
              ))}
              {colorSwatches.length > 6 && (
                <span className="text-xs opacity-40">+{colorSwatches.length - 6}</span>
              )}
            </div>
          )}

          {/* Size Options */}
          {sizes.length > 0 && (
            <div className="flex items-center gap-2 pt-1 flex-wrap">
              {sizes.map(size => (
                <span
                  key={size}
                  className="text-xs px-2.5 py-1 bg-[rgba(246,237,221,0.05)] border border-[rgba(246,237,221,0.1)] rounded-md opacity-60"
                >
                  {size}
                </span>
              ))}
            </div>
          )}

          {/* Quick View CTA */}
          <p className="text-xs opacity-30 pt-2 group-hover:opacity-50 transition-opacity">
            Click for details
          </p>
        </div>
      </div>

      {/* Quick View Modal */}
      <ProductQuickView
        product={product}
        isOpen={isQuickViewOpen}
        onClose={() => setIsQuickViewOpen(false)}
      />
    </>
  );
}
