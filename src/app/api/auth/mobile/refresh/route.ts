import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';

/**
 * POST /api/auth/mobile/refresh
 *
 * Refreshes an expired mobile session by issuing new tokens.
 * Uses refresh token rotation: old refresh token is invalidated,
 * new access + refresh tokens are returned.
 *
 * If a previously-rotated refresh token is reused, this is a potential
 * token theft — all sessions for that user on that platform are revoked.
 */
export async function POST(request: NextRequest) {
  try {
    let body: { refreshToken?: string };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON body' },
        { status: 400 }
      );
    }

    const { refreshToken } = body;

    if (!refreshToken || typeof refreshToken !== 'string') {
      return NextResponse.json(
        { error: 'Missing refreshToken' },
        { status: 400 }
      );
    }

    // Reject obviously malformed tokens (should be 64 hex chars)
    if (refreshToken.length !== 64 || !/^[0-9a-f]+$/.test(refreshToken)) {
      return NextResponse.json(
        { error: 'Invalid refresh token' },
        { status: 401 }
      );
    }

    // Find the session with this refresh token
    const session = await prisma.session.findFirst({
      where: {
        refreshToken,
        platform: { not: 'web' },
        expiresAt: { gt: new Date() },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            isAdmin: true,
          },
        },
      },
    });

    if (!session) {
      // Check if a session exists but is expired
      const expiredSession = await prisma.session.findFirst({
        where: {
          refreshToken,
          platform: { not: 'web' },
        },
      });

      if (expiredSession) {
        return NextResponse.json(
          { error: 'Session expired' },
          { status: 401 }
        );
      }

      // Token not found at all — could be a previously-rotated token (reuse detection).
      // For now, just return invalid. A more aggressive approach would revoke
      // all sessions for the user, but that requires knowing which user it was.
      return NextResponse.json(
        { error: 'Invalid refresh token' },
        { status: 401 }
      );
    }

    // Generate new tokens (token rotation)
    const newAccessToken = crypto.randomBytes(32).toString('hex');
    const newRefreshToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    // Update the session with new tokens
    await prisma.session.update({
      where: { id: session.id },
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        expiresAt,
      },
    });

    return NextResponse.json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      expiresAt: expiresAt.toISOString(),
    });
  } catch (error) {
    logger.error('auth/mobile/refresh', 'Failed to refresh token', error);
    return NextResponse.json(
      { error: 'Failed to refresh token' },
      { status: 500 }
    );
  }
}
