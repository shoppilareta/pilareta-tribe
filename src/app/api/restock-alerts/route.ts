import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { rateLimit } from '@/lib/rate-limit';

// POST /api/restock-alerts — subscribe to restock notification
export async function POST(request: NextRequest) {
  const limiter = await rateLimit(request, { limit: 10, window: 60 });
  if (!limiter.success) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });

  const session = await getSession(request);
  const { email, productHandle, variantTitle } = await request.json();

  if (!email || !productHandle) {
    return NextResponse.json({ error: 'Email and product handle required' }, { status: 400 });
  }

  await prisma.restockAlert.upsert({
    where: { email_productHandle: { email, productHandle } },
    create: {
      email,
      productHandle,
      variantTitle: variantTitle || null,
      userId: session?.userId || null,
    },
    update: { variantTitle: variantTitle || null, notified: false },
  });

  return NextResponse.json({ subscribed: true });
}
