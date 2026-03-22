import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db';

// DELETE /api/studios/favorites/[studioId] — remove studio from favorites
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ studioId: string }> }
) {
  const session = await getSession(request);
  if (!session?.userId) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const { studioId } = await params;

  await prisma.studioFavorite.deleteMany({
    where: { userId: session.userId, studioId },
  });

  return NextResponse.json({ favorited: false });
}
