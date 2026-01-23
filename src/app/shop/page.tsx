import { getProducts } from '@/lib/shopify/queries';
import { isShopifyConfigured } from '@/lib/shopify/client';
import { ProductGrid } from '@/components/shop';
import Link from 'next/link';
import type { ShopifyProduct } from '@/lib/shopify/types';

export const revalidate = 300; // Revalidate every 5 minutes

export const metadata = {
  title: 'Shop | Pilareta Tribe',
  description: 'Curated Pilates apparel for your practice. Shop the Pilareta collection.',
};

export default async function ShopPage() {
  // Check if Shopify is configured
  if (!isShopifyConfigured()) {
    return (
      <div className="container py-12">
        <div className="text-center py-16">
          <svg className="w-16 h-16 mx-auto opacity-30 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <h1 className="text-2xl font-light mb-4">Shop Coming Soon</h1>
          <p className="opacity-70 mb-6">Our shop is being set up. Check back soon!</p>
          <Link href="/" className="btn-outline">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  let products: ShopifyProduct[] = [];
  let error: string | null = null;

  try {
    products = await getProducts(50);
  } catch (e) {
    console.error('Failed to fetch products:', e);
    error = e instanceof Error ? e.message : 'Failed to load products';
  }

  return (
    <div className="container py-8 md:py-12">
      {/* Header */}
      <div className="mb-8 md:mb-12 w-full">
        <h1 className="text-3xl md:text-4xl font-light mb-3">Shop Pilareta</h1>
        <p className="opacity-70" style={{ maxWidth: '42rem' }}>
          Curated apparel designed for your Pilates practice. Quality pieces that move with you.
        </p>
      </div>

      {/* Error State */}
      {error && (
        <div className="text-center py-12">
          <p className="text-red-400 mb-4">{error}</p>
          <Link href="/" className="btn-outline">
            Back to Home
          </Link>
        </div>
      )}

      {/* Products Grid */}
      {!error && <ProductGrid products={products} />}

      {/* External Shop Link */}
      {!error && products.length > 0 && (
        <div className="mt-12 text-center border-t border-[rgba(246,237,221,0.1)] pt-8">
          <p className="opacity-60 mb-4">
            Looking for more? Visit our full collection.
          </p>
          <a
            href="https://pilareta.com"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary inline-flex items-center gap-2"
          >
            Visit Pilareta.com
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      )}
    </div>
  );
}
