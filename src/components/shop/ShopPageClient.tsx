'use client';

import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import type { ShopifyProduct } from '@/lib/shopify/types';
import { ProductGrid } from './ProductGrid';
import { WishlistProvider } from './WishlistProvider';
import { ToastProvider } from './ToastProvider';

interface ShopPageClientProps {
  products: ShopifyProduct[];
}

type SortOption = 'default' | 'price-asc' | 'price-desc';

function getCollectionLabel(product: ShopifyProduct): string {
  if (product.collections && product.collections.length > 0) {
    return product.collections[0].title;
  }
  const type = product.productType?.toLowerCase() || '';
  const title = product.title.toLowerCase();
  if (type.includes('top') || title.includes('top') || title.includes('bra') || title.includes('tee')) return 'Tops';
  if (type.includes('bottom') || title.includes('legging') || title.includes('short') || title.includes('skort') || title.includes('pant')) return 'Lowers';
  if (type.includes('dress') || title.includes('dress') || title.includes('romper')) return 'Dresses';
  if (type.includes('set') || title.includes('set')) return 'Sets';
  if (type.includes('accessor') || title.includes('bag') || title.includes('mat') || title.includes('strap')) return 'Accessories';
  return 'Other';
}

export function ShopPageClient({ products }: ShopPageClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('default');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounce search input
  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedQuery(value);
    }, 250);
  }, []);

  // Clean up timer
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  // Extract unique categories from products
  const categories = useMemo(() => {
    const cats = new Set<string>();
    for (const p of products) {
      cats.add(getCollectionLabel(p));
    }
    return ['All', ...Array.from(cats).sort()];
  }, [products]);

  // Filter + sort products
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Category filter
    if (activeCategory !== 'All') {
      result = result.filter(p => getCollectionLabel(p) === activeCategory);
    }

    // Search filter
    if (debouncedQuery.trim()) {
      const q = debouncedQuery.toLowerCase().trim();
      result = result.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.productType?.toLowerCase().includes(q) ||
        p.tags?.some(t => t.toLowerCase().includes(q))
      );
    }

    // Sort
    if (sortBy === 'price-asc') {
      result.sort((a, b) =>
        parseFloat(a.priceRange.minVariantPrice.amount) - parseFloat(b.priceRange.minVariantPrice.amount)
      );
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) =>
        parseFloat(b.priceRange.minVariantPrice.amount) - parseFloat(a.priceRange.minVariantPrice.amount)
      );
    }

    return result;
  }, [products, activeCategory, debouncedQuery, sortBy]);

  return (
    <ToastProvider>
      <WishlistProvider>
        {/* Search + Sort Row */}
        <div
          style={{
            display: 'flex',
            gap: '0.75rem',
            marginBottom: '1.25rem',
            flexWrap: 'wrap',
            alignItems: 'stretch',
          }}
        >
          {/* Search Bar */}
          <div style={{ position: 'relative', flex: '1 1 16rem', minWidth: '12rem' }}>
            <svg
              style={{
                position: 'absolute',
                left: '0.85rem',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '1.1rem',
                height: '1.1rem',
                opacity: 0.4,
              }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={e => handleSearchChange(e.target.value)}
              placeholder="Search products..."
              style={{
                width: '100%',
                paddingLeft: '2.6rem',
                paddingRight: searchQuery ? '2.4rem' : '1rem',
                paddingTop: '0.65rem',
                paddingBottom: '0.65rem',
                borderRadius: '9999px',
                background: 'rgba(70, 74, 60, 0.3)',
                border: '1px solid rgba(246, 237, 221, 0.15)',
                color: '#f6eddd',
                fontSize: '0.875rem',
                transition: 'border-color 0.2s',
              }}
            />
            {searchQuery && (
              <button
                onClick={() => { setSearchQuery(''); setDebouncedQuery(''); }}
                style={{
                  position: 'absolute',
                  right: '0.7rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '1.4rem',
                  height: '1.4rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '50%',
                  background: 'rgba(246, 237, 221, 0.15)',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#f6eddd',
                }}
                aria-label="Clear search"
              >
                <svg style={{ width: '0.7rem', height: '0.7rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Sort Dropdown */}
          <div style={{ position: 'relative', flex: '0 0 auto' }}>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as SortOption)}
              style={{
                appearance: 'none',
                paddingLeft: '1rem',
                paddingRight: '2.2rem',
                paddingTop: '0.65rem',
                paddingBottom: '0.65rem',
                borderRadius: '9999px',
                background: 'rgba(70, 74, 60, 0.3)',
                border: '1px solid rgba(246, 237, 221, 0.15)',
                color: '#f6eddd',
                fontSize: '0.875rem',
                cursor: 'pointer',
                transition: 'border-color 0.2s',
                width: 'auto',
              }}
            >
              <option value="default">Sort: Default</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
            <svg
              style={{
                position: 'absolute',
                right: '0.85rem',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '0.9rem',
                height: '0.9rem',
                opacity: 0.5,
                pointerEvents: 'none',
              }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* Category Filter Pills */}
        {categories.length > 2 && (
          <div
            style={{
              display: 'flex',
              gap: '0.5rem',
              marginBottom: '1.5rem',
              overflowX: 'auto',
              paddingBottom: '0.25rem',
              WebkitOverflowScrolling: 'touch',
              scrollbarWidth: 'none',
            }}
          >
            {categories.map(cat => {
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  style={{
                    flexShrink: 0,
                    padding: '0.4rem 1rem',
                    borderRadius: '9999px',
                    fontSize: '0.8rem',
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    border: isActive
                      ? '1px solid #f6eddd'
                      : '1px solid rgba(246, 237, 221, 0.15)',
                    background: isActive
                      ? '#f6eddd'
                      : 'rgba(70, 74, 60, 0.2)',
                    color: isActive
                      ? '#1a1c16'
                      : 'rgba(246, 237, 221, 0.7)',
                    letterSpacing: '0.01em',
                  }}
                >
                  {cat}
                  {cat !== 'All' && (
                    <span style={{ marginLeft: '0.35rem', opacity: 0.5, fontSize: '0.7rem' }}>
                      {products.filter(p => getCollectionLabel(p) === cat).length}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Result count when searching */}
        {(debouncedQuery.trim() || activeCategory !== 'All') && (
          <p style={{ fontSize: '0.8rem', opacity: 0.5, marginBottom: '1rem' }}>
            {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'} found
            {debouncedQuery.trim() && <> for &ldquo;{debouncedQuery.trim()}&rdquo;</>}
            {activeCategory !== 'All' && <> in {activeCategory}</>}
          </p>
        )}

        {/* Product Grid */}
        {filteredProducts.length > 0 ? (
          <ProductGrid
            products={filteredProducts}
            skipGrouping={activeCategory !== 'All' || sortBy !== 'default' || debouncedQuery.trim().length > 0}
          />
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem 0' }}>
            <svg
              style={{ width: '3rem', height: '3rem', margin: '0 auto 1rem', opacity: 0.2 }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <p style={{ opacity: 0.5, marginBottom: '0.5rem' }}>No products match your search</p>
            <button
              onClick={() => { setSearchQuery(''); setDebouncedQuery(''); setActiveCategory('All'); setSortBy('default'); }}
              style={{
                background: 'none',
                border: '1px solid rgba(246, 237, 221, 0.3)',
                borderRadius: '9999px',
                padding: '0.5rem 1.25rem',
                color: '#f6eddd',
                fontSize: '0.8rem',
                cursor: 'pointer',
                opacity: 0.7,
              }}
            >
              Clear filters
            </button>
          </div>
        )}
      </WishlistProvider>
    </ToastProvider>
  );
}
