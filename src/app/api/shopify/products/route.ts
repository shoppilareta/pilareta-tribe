import { NextResponse } from 'next/server';
import { getProducts } from '@/lib/shopify/queries';
import { isShopifyConfigured } from '@/lib/shopify/client';
import { logger } from '@/lib/logger';

// Cache products for 1 minute so new products/descriptions show quickly
export const revalidate = 60;

export async function GET() {
  try {
    if (!isShopifyConfigured()) {
      return NextResponse.json(
        { error: 'Shopify is not configured' },
        { status: 503 }
      );
    }

    const products = await getProducts(250);

    return NextResponse.json({ products });
  } catch (error) {
    logger.error('shopify/products', 'Failed to fetch products', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}
