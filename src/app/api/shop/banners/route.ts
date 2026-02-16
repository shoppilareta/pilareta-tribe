import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/shop/banners — Get active banners (public, no auth)
export async function GET() {
  try {
    const now = new Date();
    const banners = await prisma.shopBanner.findMany({
      where: {
        isActive: true,
        OR: [
          { startDate: null, endDate: null },
          { startDate: { lte: now }, endDate: null },
          { startDate: null, endDate: { gte: now } },
          { startDate: { lte: now }, endDate: { gte: now } },
        ],
      },
      orderBy: { position: 'asc' },
    });
    return NextResponse.json({ banners });
  } catch (error) {
    console.error('Error fetching banners:', error);
    return NextResponse.json({ error: 'Failed to fetch banners' }, { status: 500 });
  }
}
