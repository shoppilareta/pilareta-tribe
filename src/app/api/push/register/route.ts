import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { rateLimit } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';

// POST /api/push/register — Register or update a push token for the authenticated user
export async function POST(request: NextRequest) {
  try {
    const limiter = await rateLimit(request, { limit: 10, window: 60 });
    if (!limiter.success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const session = await getSession(request);
    if (!session?.userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { token, platform } = await request.json();

    if (!token || typeof token !== 'string') {
      return NextResponse.json({ error: 'Push token is required' }, { status: 400 });
    }

    // Validate token looks like an Expo push token
    if (!token.startsWith('ExponentPushToken[') && !token.startsWith('ExpoPushToken[')) {
      return NextResponse.json({ error: 'Invalid push token format' }, { status: 400 });
    }

    if (token.length > 200) {
      return NextResponse.json({ error: 'Push token too long' }, { status: 400 });
    }

    if (!platform || !['ios', 'android'].includes(platform)) {
      return NextResponse.json({ error: 'Platform must be "ios" or "android"' }, { status: 400 });
    }

    // Delete any existing record with the same token but a different user
    // to prevent device takeover (new user inheriting old push token)
    await prisma.pushToken.deleteMany({
      where: {
        token,
        userId: { not: session.userId },
      },
    });

    // Upsert: if this user already has this token, update it; otherwise create
    const pushToken = await prisma.pushToken.upsert({
      where: { token },
      update: {
        platform,
      },
      create: {
        userId: session.userId,
        token,
        platform,
      },
    });

    return NextResponse.json({ pushToken }, { status: 200 });
  } catch (error) {
    logger.error('push/register', 'Failed to register push token', error);
    return NextResponse.json({ error: 'Failed to register push token' }, { status: 500 });
  }
}
