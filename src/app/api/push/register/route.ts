import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';

// POST /api/push/register — Register or update a push token for the authenticated user
export async function POST(request: NextRequest) {
  try {
    const session = await getSession(request);
    if (!session?.userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { token, platform } = await request.json();

    if (!token || typeof token !== 'string') {
      return NextResponse.json({ error: 'Push token is required' }, { status: 400 });
    }

    if (!platform || !['ios', 'android'].includes(platform)) {
      return NextResponse.json({ error: 'Platform must be "ios" or "android"' }, { status: 400 });
    }

    // Upsert: if this token already exists, update it (reassign to current user/platform)
    // If the same user already has a token, update it
    const pushToken = await prisma.pushToken.upsert({
      where: { token },
      update: {
        userId: session.userId,
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
    console.error('Error registering push token:', error);
    return NextResponse.json({ error: 'Failed to register push token' }, { status: 500 });
  }
}
