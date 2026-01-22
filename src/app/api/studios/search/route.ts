import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/studios/search - Search studios by name
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    if (!query || query.trim().length < 2) {
      return NextResponse.json({ studios: [] });
    }

    const studios = await prisma.studio.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { city: { contains: query, mode: 'insensitive' } },
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
    console.error('Error searching studios:', error);
    return NextResponse.json({ error: 'Failed to search studios' }, { status: 500 });
  }
}
