import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { logger } from '@/lib/logger';

// GET /api/admin/exercises - List all exercises
export async function GET(request: NextRequest) {
  try {
    const session = await getSession(request);
    if (!session?.isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';

    const exercises = await prisma.exercise.findMany({
      where: search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { slug: { contains: search, mode: 'insensitive' } },
            ],
          }
        : undefined,
      orderBy: { name: 'asc' },
      select: {
        id: true,
        slug: true,
        name: true,
        equipment: true,
        difficulty: true,
        videoUrl: true,
        imageUrl: true,
        isVerified: true,
        focusAreas: true,
      },
    });

    return NextResponse.json({ exercises });
  } catch (error) {
    logger.error('admin/exercises', 'Failed to fetch exercises', error);
    return NextResponse.json({ error: 'Failed to fetch exercises' }, { status: 500 });
  }
}
