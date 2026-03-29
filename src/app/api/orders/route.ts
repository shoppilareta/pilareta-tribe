import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getCustomerOrders } from '@/lib/shopify/customer-api';
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

  try {
    const orders = await getCustomerOrders(shopifyAccessToken);
    return NextResponse.json({ orders });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    logger.error('orders', 'Failed to fetch orders', error);

    if (message === 'Shop configuration error') {
      return NextResponse.json({ error: 'orders_not_configured', orders: [] }, { status: 200 });
    }
    if (message === 'No active session found') {
      return NextResponse.json({ error: 'session_expired', orders: [] }, { status: 200 });
    }
    if (message.startsWith('Customer API error:')) {
      const hasAnySession = await prisma.session.findFirst({
        where: { userId: session.userId },
        select: { id: true },
      });
      if (hasAnySession) {
        return NextResponse.json({ error: 'session_expired', orders: [] }, { status: 200 });
      }
      return NextResponse.json({ error: 'no_shopify_account', orders: [] }, { status: 200 });
    }

    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}
