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

  try {
    const orders = await getCustomerOrders(session.userId);
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
