import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db';

// GET /api/studios/favorites — get user's favorite studio IDs
export async function GET(request: NextRequest) {
  const session = await getSession(request);
  if (!session?.userId) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const favorites = await prisma.studioFavorite.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: 'desc' },
    select: { studioId: true },
  });

  return NextResponse.json({ studioIds: favorites.map(f => f.studioId) });
}

// POST /api/studios/favorites — add studio to favorites
export async function POST(request: NextRequest) {
  const session = await getSession(request);
  if (!session?.userId) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const { studioId } = await request.json();
  if (!studioId || typeof studioId !== 'string') {
    return NextResponse.json({ error: 'studioId required' }, { status: 400 });
  }

  await prisma.studioFavorite.upsert({
    where: { userId_studioId: { userId: session.userId, studioId } },
    create: { userId: session.userId, studioId },
    update: {},
  });

  return NextResponse.json({ favorited: true });
}
