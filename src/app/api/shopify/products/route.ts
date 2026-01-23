import { NextResponse } from 'next/server';
import { getProducts } from '@/lib/shopify/queries';
import { isShopifyConfigured } from '@/lib/shopify/client';

// Cache products for 5 minutes
export const revalidate = 300;

export async function GET() {
  try {
    if (!isShopifyConfigured()) {
      return NextResponse.json(
        { error: 'Shopify is not configured' },
        { status: 503 }
      );
    }

    const products = await getProducts(50);

    return NextResponse.json({ products });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}
