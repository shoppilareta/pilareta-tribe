import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';

/**
 * POST /api/auth/mobile/logout
 *
 * Logs out a mobile session by deleting the session record.
 * We don't return Shopify's end_session_endpoint here because mobile
 * sessions don't store the original id_token, so Shopify would reject
 * the logout call with "Invalid id_token". Instead, we rely on the
 * local session deletion + Shopify's natural session expiry.
 */
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing authorization header' },
        { status: 401 }
      );
    }

    const token = authHeader.slice(7);

    // Find and delete the session
    const session = await prisma.session.findFirst({
      where: { accessToken: token },
    });

    if (session) {
      await prisma.session.delete({
        where: { id: session.id },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('auth/mobile/logout', 'Mobile logout failed', error);
    return NextResponse.json(
      { error: 'Logout failed' },
      { status: 500 }
    );
  }
}
