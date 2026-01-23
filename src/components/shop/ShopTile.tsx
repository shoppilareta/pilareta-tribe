import Link from 'next/link';
import Image from 'next/image';
import type { ShopifyProduct } from '@/lib/shopify/types';

interface ShopTileProps {
  products: ShopifyProduct[];
}

export function ShopTile({ products }: ShopTileProps) {
  // Take first 6 products for preview
  const previewProducts = products.slice(0, 6);

  return (
    <section className="card">
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              background: 'rgba(246, 237, 221, 0.1)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f6eddd" strokeWidth="1.5">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 500, margin: 0 }}>Shop Pilareta</h2>
        </div>
        <p style={{ color: 'rgba(246, 237, 221, 0.6)', fontSize: '0.875rem', margin: 0 }}>
          Curated apparel for your Pilates practice
        </p>
      </div>

      {/* Product preview grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '4px',
          marginBottom: '1rem',
          borderRadius: '4px',
          overflow: 'hidden',
        }}
      >
        {previewProducts.length > 0
          ? previewProducts.map((product) => (
              <div
                key={product.id}
                style={{
                  aspectRatio: '1',
                  background: 'rgba(246, 237, 221, 0.05)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {product.featuredImage ? (
                  <Image
                    src={product.featuredImage.url}
                    alt={product.featuredImage.altText || product.title}
                    fill
                    sizes="100px"
                    style={{ objectFit: 'cover' }}
                  />
                ) : (
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f6eddd" strokeWidth="1" opacity="0.3">
                      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                      <line x1="3" y1="6" x2="21" y2="6" />
                      <path d="M16 10a4 4 0 0 1-8 0" />
                    </svg>
                  </div>
                )}
              </div>
            ))
          : [1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                style={{
                  aspectRatio: '1',
                  background: `rgba(246, 237, 221, ${0.03 + i * 0.01})`,
                }}
              />
            ))}
      </div>

      {/* Stats */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '2rem',
          marginBottom: '1.5rem',
          padding: '0.75rem',
          background: 'rgba(246, 237, 221, 0.03)',
          borderRadius: '4px',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1rem', fontWeight: 500, color: '#f6eddd' }}>
            {products.length > 0 ? products.length : 'New'}
          </div>
          <div style={{ fontSize: '0.7rem', color: 'rgba(246, 237, 221, 0.5)' }}>Products</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1rem', fontWeight: 500, color: '#f6eddd' }}>Free</div>
          <div style={{ fontSize: '0.7rem', color: 'rgba(246, 237, 221, 0.5)' }}>Shipping 100+</div>
        </div>
      </div>

      {/* Features */}
      <ul style={{ margin: '0 0 1.5rem', padding: 0, listStyle: 'none' }}>
        {['Quality Pilates apparel', 'Secure Shopify checkout', 'Fast shipping'].map((feature) => (
          <li
            key={feature}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.8rem',
              color: 'rgba(246, 237, 221, 0.7)',
              marginBottom: '0.5rem',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            {feature}
          </li>
        ))}
      </ul>

      <Link
        href="/shop"
        className="btn btn-primary"
        style={{ width: '100%', fontSize: '0.875rem', padding: '0.75rem' }}
      >
        Browse Collection
      </Link>
    </section>
  );
}
