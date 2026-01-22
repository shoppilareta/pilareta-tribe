import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city');
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    const where = city ? { city: { contains: city, mode: 'insensitive' as const } } : {};

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
    console.error('Error fetching studios:', error);
    return NextResponse.json(
      { error: 'Failed to fetch studios' },
      { status: 500 }
    );
  }
}
