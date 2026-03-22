import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { rateLimit } from '@/lib/rate-limit';

// GET /api/wishlist — get user's wishlist handles
export async function GET(request: NextRequest) {
  const session = await getSession(request);
  if (!session?.userId) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const items = await prisma.productWishlist.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: 'desc' },
    select: { productHandle: true },
  });

  return NextResponse.json({ handles: items.map(i => i.productHandle) });
}

// POST /api/wishlist — add product to wishlist
export async function POST(request: NextRequest) {
  const limiter = await rateLimit(request, { limit: 30, window: 60 });
  if (!limiter.success) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const session = await getSession(request);
  if (!session?.userId) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const { handle } = await request.json();
  if (!handle || typeof handle !== 'string') {
    return NextResponse.json({ error: 'Product handle required' }, { status: 400 });
  }

  await prisma.productWishlist.upsert({
    where: { userId_productHandle: { userId: session.userId, productHandle: handle } },
    create: { userId: session.userId, productHandle: handle },
    update: {},
  });

  return NextResponse.json({ wishlisted: true });
}
