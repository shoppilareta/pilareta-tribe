'use client';

import { useMemo } from 'react';
import type { ShopifyProduct } from '@/lib/shopify/types';
import { ProductCard } from './ProductCard';

interface ProductGridProps {
  products: ShopifyProduct[];
  skipGrouping?: boolean;
}

// Preferred ordering for collection groups
const COLLECTION_ORDER = [
  'tops',
  'lowers',
  'dresses',
  'sets',
  'accessories',
  'sale',
];

function getCollectionKey(product: ShopifyProduct): string {
  if (product.collections && product.collections.length > 0) {
    return product.collections[0].handle;
  }
  // Fallback: use productType or title keywords
  const type = product.productType?.toLowerCase() || '';
  const title = product.title.toLowerCase();
  if (type.includes('top') || title.includes('top') || title.includes('bra') || title.includes('tee')) return 'tops';
  if (type.includes('bottom') || title.includes('legging') || title.includes('short') || title.includes('skort') || title.includes('pant')) return 'lowers';
  if (type.includes('dress') || title.includes('dress') || title.includes('romper')) return 'dresses';
  if (type.includes('set') || title.includes('set')) return 'sets';
  if (type.includes('accessor') || title.includes('bag') || title.includes('mat') || title.includes('strap')) return 'accessories';
  return 'other';
}

function getCollectionLabel(product: ShopifyProduct): string {
  if (product.collections && product.collections.length > 0) {
    return product.collections[0].title;
  }
  const key = getCollectionKey(product);
  const labels: Record<string, string> = {
    tops: 'Tops',
    lowers: 'Lowers',
    dresses: 'Dresses',
    sets: 'Sets',
    accessories: 'Accessories',
    other: 'Other',
  };
  return labels[key] || 'Other';
}

export function ProductGrid({ products, skipGrouping = false }: ProductGridProps) {
  const groups = useMemo(() => {
    if (products.length === 0) return [];

    // Group by collection
    const groupMap = new Map<string, { label: string; products: ShopifyProduct[] }>();

    for (const product of products) {
      const key = getCollectionKey(product);
      const label = getCollectionLabel(product);
      if (!groupMap.has(key)) {
        groupMap.set(key, { label, products: [] });
      }
      groupMap.get(key)!.products.push(product);
    }

    // Sort groups by preferred order
    const sorted = [...groupMap.entries()].sort(([a], [b]) => {
      const ai = COLLECTION_ORDER.indexOf(a);
      const bi = COLLECTION_ORDER.indexOf(b);
      const aIdx = ai === -1 ? 999 : ai;
      const bIdx = bi === -1 ? 999 : bi;
      return aIdx - bIdx;
    });

    return sorted.map(([key, group]) => ({ key, ...group }));
  }, [products]);

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <svg className="w-16 h-16 mx-auto opacity-30 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
        <p className="opacity-70">No products found</p>
      </div>
    );
  }

  // Flat grid when search/filter/sort is active, or only one group
  if (skipGrouping || groups.length === 1) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
      {groups.map((group) => (
        <section key={group.key}>
          <h2
            style={{
              fontSize: '1.25rem',
              fontWeight: 400,
              color: '#f6eddd',
              marginBottom: '1.25rem',
              paddingBottom: '0.5rem',
              borderBottom: '1px solid rgba(246, 237, 221, 0.1)',
              letterSpacing: '-0.01em',
            }}
          >
            {group.label}
            <span
              style={{
                fontSize: '0.8rem',
                color: 'rgba(246, 237, 221, 0.4)',
                fontWeight: 400,
                marginLeft: '0.75rem',
              }}
            >
              {group.products.length}
            </span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {group.products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
