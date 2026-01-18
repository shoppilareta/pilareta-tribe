import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/db';

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

    return NextResponse.redirect(appUrl);
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.redirect(appUrl);
  }
}

export async function POST() {
  return GET();
}
