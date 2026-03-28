import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';

// GET /api/studios/search - Search studios by name
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const limitParam = parseInt(searchParams.get('limit') || '10', 10);
    const limit = isNaN(limitParam) ? 10 : Math.min(Math.max(limitParam, 1), 100);

    if (query && query.length > 200) {
      return NextResponse.json({ error: 'Query too long' }, { status: 400 });
    }

    if (!query || query.trim().length < 2) {
      return NextResponse.json({ studios: [] });
    }

    const studios = await prisma.studio.findMany({
      where: {
        OR: [
          { name: { contains: query.trim(), mode: 'insensitive' } },
          { city: { contains: query.trim(), mode: 'insensitive' } },
        ],
      },
      take: Math.min(limit, 20),
      select: {
        id: true,
        name: true,
        city: true,
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({ studios });
  } catch (error) {
    logger.error('studios/search', 'Failed to search studios', error);
    return NextResponse.json({ error: 'Failed to search studios' }, { status: 500 });
  }
}
