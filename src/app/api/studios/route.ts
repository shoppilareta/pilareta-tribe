import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city');
    const q = searchParams.get('q'); // General search query
    const limitParsed = parseInt(searchParams.get('limit') || '50', 10);
    const limit = isNaN(limitParsed) ? 50 : Math.min(Math.max(limitParsed, 1), 100);
    const offsetParsed = parseInt(searchParams.get('offset') || '0', 10);
    const offset = isNaN(offsetParsed) || offsetParsed < 0 ? 0 : offsetParsed;

    // Build where clause
    let where: Record<string, unknown> = {};

    if (q) {
      // Search by name or city
      where = {
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { city: { contains: q, mode: 'insensitive' } },
        ],
      };
    } else if (city) {
      where = { city: { contains: city, mode: 'insensitive' } };
    }

    const [studios, total] = await Promise.all([
      prisma.studio.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { name: 'asc' },
      }),
      prisma.studio.count({ where }),
    ]);

    return NextResponse.json({
      studios,
      total,
      limit,
      offset,
    });
  } catch (error) {
    logger.error('studios', 'Failed to fetch studios', error);
    return NextResponse.json(
      { error: 'Failed to fetch studios' },
      { status: 500 }
    );
  }
}
