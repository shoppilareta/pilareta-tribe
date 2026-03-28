import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import crypto from 'crypto';
import { logger } from '@/lib/logger';

// POST /api/auth/mobile/facebook — Sign in with Facebook
export async function POST(request: NextRequest) {
  try {
    let body: { accessToken?: string; platform?: string };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }
    const { accessToken: fbToken, platform } = body;

    if (!fbToken) {
      return NextResponse.json({ error: 'Facebook access token is required' }, { status: 400 });
    }

    // Validate platform value
    const validPlatforms = ['ios', 'android'];
    const safePlatform = validPlatforms.includes(platform || '') ? platform! : 'ios';

    // Verify Facebook token and get user info
    const fbController = new AbortController();
    const fbTimeout = setTimeout(() => fbController.abort(), 10000);
    const fbResponse = await fetch(
      `https://graph.facebook.com/me?fields=id,email,first_name,last_name&access_token=${encodeURIComponent(fbToken)}`,
      { signal: fbController.signal }
    );
    clearTimeout(fbTimeout);

    if (!fbResponse.ok) {
      return NextResponse.json({ error: 'Invalid Facebook token' }, { status: 401 });
    }

    const fbUser = await fbResponse.json();

    if (!fbUser.email) {
      return NextResponse.json(
        { error: 'Email permission is required. Please grant email access and try again.' },
        { status: 400 }
      );
    }

    const normalizedEmail = fbUser.email.toLowerCase().trim();

    // Find or create user by email
    let user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: normalizedEmail,
          firstName: fbUser.first_name || null,
          lastName: fbUser.last_name || null,
        },
      });
    }

    // Create session
    const accessToken = crypto.randomBytes(32).toString('hex');
    const refreshToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    await prisma.session.create({
      data: {
        userId: user.id,
        accessToken,
        refreshToken,
        platform: safePlatform,
        expiresAt,
      },
    });

    return NextResponse.json({
      accessToken,
      refreshToken,
      expiresAt: expiresAt.toISOString(),
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isAdmin: user.isAdmin,
      },
    });
  } catch (error) {
    logger.error('auth/mobile/facebook', 'Facebook auth failed', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}
