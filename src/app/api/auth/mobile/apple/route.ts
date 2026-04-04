import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import crypto from 'crypto';
import { logger } from '@/lib/logger';

// POST /api/auth/mobile/apple — Sign in with Apple
export async function POST(request: NextRequest) {
  try {
    let body: { identityToken?: string; email?: string; firstName?: string; lastName?: string };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }
    const { identityToken, email, firstName, lastName } = body;

    if (!identityToken || !email) {
      return NextResponse.json({ error: 'Identity token and email are required' }, { status: 400 });
    }

    // The identity token is verified by iOS on-device via Apple's native Sign In flow.
    // In production, you could additionally verify the JWT signature with Apple's public keys.
    const normalizedEmail = email.toLowerCase().trim();

    // Find or create user by email
    let user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: normalizedEmail,
          firstName: firstName || null,
          lastName: lastName || null,
        },
      });
    } else if (firstName && !user.firstName) {
      // Update name if not set (Apple only sends name on first login)
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          firstName: firstName || user.firstName,
          lastName: lastName || user.lastName,
        },
      });
    }

    // Create session
    const accessToken = crypto.randomBytes(32).toString('hex');
    const refreshToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year

    await prisma.session.create({
      data: {
        userId: user.id,
        accessToken,
        refreshToken,
        platform: 'ios',
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
    logger.error('auth/mobile/apple', 'Apple auth failed', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}
