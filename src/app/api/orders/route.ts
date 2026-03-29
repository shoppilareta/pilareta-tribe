import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getCustomerOrders, getOrdersViaAdminApi, isAdminApiConfigured } from '@/lib/shopify/customer-api';
import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';

// GET /api/orders — Get customer orders from Shopify
export async function GET(request: NextRequest) {
  const session = await getSession(request);
  if (!session?.userId) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  // Extract the Shopify access token from the DB session that was already
  // looked up by getSession(). For Bearer-token auth (mobile), the token in
  // the Authorization header IS the DB session's accessToken, so we can
  // retrieve it directly from the database row that was already validated.
  const authHeader = request.headers.get('authorization');
  let shopifyAccessToken: string | null = null;

  if (authHeader?.startsWith('Bearer ')) {
    // Mobile: the Bearer token IS the session accessToken stored in DB.
    // getSession() already validated it, so we can use it directly.
    shopifyAccessToken = authHeader.slice(7);
  } else {
    // Web: look up the most recent session for this user
    const dbSession = await prisma.session.findFirst({
      where: { userId: session.userId, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: 'desc' },
      select: { accessToken: true },
    });
    shopifyAccessToken = dbSession?.accessToken ?? null;
  }

  if (!shopifyAccessToken) {
    return NextResponse.json({ error: 'session_expired', orders: [] }, { status: 200 });
  }

  // Look up the user's email for Admin API fallback
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { email: true },
  });

  try {
    const orders = await getCustomerOrders(shopifyAccessToken);
    return NextResponse.json({ orders });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    logger.error('orders', 'Customer API failed, checking fallbacks', error);

    if (message === 'Shop configuration error') {
      // If Admin API is configured, try that as fallback
      if (isAdminApiConfigured() && user?.email) {
        try {
          const orders = await getOrdersViaAdminApi(user.email);
          return NextResponse.json({ orders });
        } catch (adminError) {
          logger.error('orders', 'Admin API fallback also failed', adminError);
        }
      }
      return NextResponse.json({ error: 'orders_not_configured', orders: [] }, { status: 200 });
    }
    if (message === 'No active session found') {
      return NextResponse.json({ error: 'session_expired', orders: [] }, { status: 200 });
    }
    if (message.startsWith('Customer API error:') || message.startsWith('Customer API GraphQL error:')) {
      // Customer API returned an error (404, auth failure, etc.).
      // Try Admin API as fallback if configured.
      if (isAdminApiConfigured() && user?.email) {
        try {
          logger.info('orders', 'Falling back to Admin API for order fetch');
          const orders = await getOrdersViaAdminApi(user.email);
          return NextResponse.json({ orders });
        } catch (adminError) {
          logger.error('orders', 'Admin API fallback also failed', adminError);
        }
      }

      // No fallback available — return a specific error so the mobile app
      // can show a helpful message (e.g., "View on pilareta.com").
      return NextResponse.json({ error: 'shopify_token_expired', orders: [] }, { status: 200 });
    }

    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}
