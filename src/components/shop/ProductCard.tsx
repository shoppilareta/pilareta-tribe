'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { ShopifyProduct } from '@/lib/shopify/types';
import { ProductQuickView } from './ProductQuickView';

interface ProductCardProps {
  product: ShopifyProduct;
}

function formatPrice(amount: string, currencyCode: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
  }).format(parseFloat(amount));
}

export function ProductCard({ product }: ProductCardProps) {
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const { minVariantPrice, maxVariantPrice } = product.priceRange;
  const hasMultiplePrices = minVariantPrice.amount !== maxVariantPrice.amount;

  // Extract unique colors from variants
  const colors = Array.from(new Set(
    product.variants
      .flatMap(v => v.selectedOptions)
      .filter(opt => opt.name.toLowerCase() === 'color' || opt.name.toLowerCase() === 'colour')
      .map(opt => opt.value)
  ));

  // Extract unique sizes from variants
  const sizes = Array.from(new Set(
    product.variants
      .flatMap(v => v.selectedOptions)
      .filter(opt => opt.name.toLowerCase() === 'size')
      .map(opt => opt.value)
  ));

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

          {/* Out of Stock Badge */}
          {!product.availableForSale && (
            <div className="absolute top-3 left-3 bg-[#202219]/90 text-xs px-3 py-1.5 rounded-full">
              Sold Out
            </div>
          )}

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

          <p className="text-sm opacity-60">
            {hasMultiplePrices ? (
              <>From {formatPrice(minVariantPrice.amount, minVariantPrice.currencyCode)}</>
            ) : (
              formatPrice(minVariantPrice.amount, minVariantPrice.currencyCode)
            )}
          </p>

          {/* Color Swatches */}
          {colors.length > 0 && (
            <div className="flex items-center gap-2 pt-1">
              {colors.slice(0, 6).map(color => (
                <div
                  key={color}
                  className="w-6 h-6 rounded-full border border-[rgba(246,237,221,0.2)]"
                  style={{ backgroundColor: getColorCode(color) }}
                  title={color}
                />
              ))}
              {colors.length > 6 && (
                <span className="text-xs opacity-40">+{colors.length - 6}</span>
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

// Helper to convert color names to hex codes
function getColorCode(colorName: string): string {
  const colors: Record<string, string> = {
    'black': '#1a1a1a',
    'white': '#f5f5f5',
    'red': '#dc2626',
    'blue': '#2563eb',
    'navy': '#1e3a5f',
    'green': '#16a34a',
    'olive': '#6b7f3a',
    'grey': '#6b7280',
    'gray': '#6b7280',
    'pink': '#ec4899',
    'purple': '#9333ea',
    'brown': '#78350f',
    'beige': '#d4c4a8',
    'cream': '#f6eddd',
    'tan': '#d2b48c',
    'maroon': '#7f1d1d',
    'orange': '#ea580c',
    'yellow': '#eab308',
    'coral': '#f87171',
    'teal': '#0d9488',
    'turquoise': '#06b6d4',
    'lavender': '#a78bfa',
    'mint': '#6ee7b7',
    'nude': '#e8c4a0',
    'burgundy': '#722f37',
    'charcoal': '#374151',
    'ivory': '#fffff0',
    'khaki': '#c3b091',
    'mauve': '#e0b0ff',
    'peach': '#ffcba4',
    'plum': '#8e4585',
    'rose': '#ff007f',
    'rust': '#b7410e',
    'sage': '#9caf88',
    'salmon': '#fa8072',
    'sand': '#c2b280',
    'silver': '#c0c0c0',
    'slate': '#708090',
    'wine': '#722f37',
  };

  const normalized = colorName.toLowerCase().trim();
  return colors[normalized] || '#6b7280';
}
