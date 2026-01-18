import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/db';
import { discoverEndpoints } from '@/lib/shopify-auth';

export async function GET() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://tribe.pilareta.com';

  try {
    const session = await getSession();

    // Delete session from database if exists
    if (session.userId) {
      await prisma.session.deleteMany({
        where: { userId: session.userId },
      });
    }

    // Destroy session cookie
    session.destroy();

    // Redirect to Shopify's logout endpoint to fully end the session
    try {
      const config = await discoverEndpoints();
      if (config.end_session_endpoint) {
        const logoutUrl = new URL(config.end_session_endpoint);
        logoutUrl.searchParams.set('post_logout_redirect_uri', appUrl);
        return NextResponse.redirect(logoutUrl.toString());
      }
    } catch {
      // If discovery fails, just redirect home
    }

    return NextResponse.redirect(appUrl);
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.redirect(appUrl);
  }
}

export async function POST() {
  return GET();
}
