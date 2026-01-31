import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { discoverEndpoints } from '@/lib/shopify-auth';

/**
 * POST /api/auth/mobile/logout
 *
 * Logs out a mobile session by deleting the session record.
 * Returns the Shopify logout URL if available, so the mobile app
 * can optionally clear the Shopify session too.
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

    // Optionally return Shopify logout URL
    let logoutUrl: string | undefined;
    try {
      const config = await discoverEndpoints();
      if (config.end_session_endpoint) {
        logoutUrl = config.end_session_endpoint;
      }
    } catch {
      // Not critical if we can't get the logout URL
    }

    return NextResponse.json({
      success: true,
      logoutUrl,
    });
  } catch (error) {
    console.error('Mobile logout error:', error);
    return NextResponse.json(
      { error: 'Logout failed' },
      { status: 500 }
    );
  }
}
