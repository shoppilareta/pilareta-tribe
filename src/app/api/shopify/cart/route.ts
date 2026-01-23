import { NextRequest, NextResponse } from 'next/server';
import { createCart, addToCart, updateCartLines, removeFromCart, getCart } from '@/lib/shopify/mutations';
import { isShopifyConfigured } from '@/lib/shopify/client';

// GET - Fetch existing cart
export async function GET(request: NextRequest) {
  try {
    if (!isShopifyConfigured()) {
      return NextResponse.json(
        { error: 'Shopify is not configured' },
        { status: 503 }
      );
    }

    const { searchParams } = new URL(request.url);
    const cartId = searchParams.get('cartId');

    if (!cartId) {
      return NextResponse.json(
        { error: 'Cart ID is required' },
        { status: 400 }
      );
    }

    const cart = await getCart(cartId);

    if (!cart) {
      return NextResponse.json(
        { error: 'Cart not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ cart });
  } catch (error) {
    console.error('Error fetching cart:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cart' },
      { status: 500 }
    );
  }
}

// POST - Create cart or add to cart
export async function POST(request: NextRequest) {
  try {
    if (!isShopifyConfigured()) {
      return NextResponse.json(
        { error: 'Shopify is not configured' },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { cartId, lines } = body;

    if (!lines || !Array.isArray(lines) || lines.length === 0) {
      return NextResponse.json(
        { error: 'Lines are required' },
        { status: 400 }
      );
    }

    // Validate lines
    for (const line of lines) {
      if (!line.merchandiseId || typeof line.quantity !== 'number') {
        return NextResponse.json(
          { error: 'Each line must have merchandiseId and quantity' },
          { status: 400 }
        );
      }
    }

    let cart;

    if (cartId) {
      // Add to existing cart
      cart = await addToCart(cartId, lines);
    } else {
      // Create new cart
      cart = await createCart(lines);
    }

    return NextResponse.json({ cart });
  } catch (error) {
    console.error('Error with cart operation:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update cart' },
      { status: 500 }
    );
  }
}

// PUT - Update cart lines
export async function PUT(request: NextRequest) {
  try {
    if (!isShopifyConfigured()) {
      return NextResponse.json(
        { error: 'Shopify is not configured' },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { cartId, lines } = body;

    if (!cartId) {
      return NextResponse.json(
        { error: 'Cart ID is required' },
        { status: 400 }
      );
    }

    if (!lines || !Array.isArray(lines) || lines.length === 0) {
      return NextResponse.json(
        { error: 'Lines are required' },
        { status: 400 }
      );
    }

    const cart = await updateCartLines(cartId, lines);

    return NextResponse.json({ cart });
  } catch (error) {
    console.error('Error updating cart:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update cart' },
      { status: 500 }
    );
  }
}

// DELETE - Remove from cart
export async function DELETE(request: NextRequest) {
  try {
    if (!isShopifyConfigured()) {
      return NextResponse.json(
        { error: 'Shopify is not configured' },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { cartId, lineIds } = body;

    if (!cartId) {
      return NextResponse.json(
        { error: 'Cart ID is required' },
        { status: 400 }
      );
    }

    if (!lineIds || !Array.isArray(lineIds) || lineIds.length === 0) {
      return NextResponse.json(
        { error: 'Line IDs are required' },
        { status: 400 }
      );
    }

    const cart = await removeFromCart(cartId, lineIds);

    return NextResponse.json({ cart });
  } catch (error) {
    console.error('Error removing from cart:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to remove from cart' },
      { status: 500 }
    );
  }
}
