import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { logAdminAction } from '@/lib/admin/audit';

// GET /api/admin/studios — List studios with optional search (admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await getSession(request);
    if (!session?.userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    const user = await prisma.user.findUnique({ where: { id: session.userId } });
    if (!user?.isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';

    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { city: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const studios = await prisma.studio.findMany({
      where,
      select: {
        id: true,
        name: true,
        city: true,
        address: true,
        formattedAddress: true,
        phoneNumber: true,
        website: true,
        rating: true,
        ratingCount: true,
        verified: true,
        googlePlaceId: true,
        createdAt: true,
        _count: {
          select: {
            claims: true,
            editSuggestions: true,
            ugcPosts: true,
          },
        },
      },
      orderBy: { name: 'asc' },
      take: 100,
    });

    return NextResponse.json({ studios });
  } catch (error) {
    logger.error('admin/studios', 'Failed to fetch studios', error);
    return NextResponse.json({ error: 'Failed to fetch studios' }, { status: 500 });
  }
}

// POST /api/admin/studios — Create a new studio (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getSession(request);
    if (!session?.userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    const user = await prisma.user.findUnique({ where: { id: session.userId } });
    if (!user?.isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();

    // Validate required fields
    if (!body.name || !body.city) {
      return NextResponse.json(
        { error: 'Missing required fields: name, city' },
        { status: 400 }
      );
    }

    const studio = await prisma.studio.create({
      data: {
        name: body.name,
        city: body.city,
        address: body.address || null,
        latitude: body.latitude ?? null,
        longitude: body.longitude ?? null,
        phoneNumber: body.phoneNumber || null,
        website: body.website || null,
        amenities: body.amenities || [],
        openingHours: body.openingHours ?? null,
        rating: body.rating ?? null,
        verified: body.verified ?? true,
      },
    });

    logger.info('admin/studios', `Created studio ${studio.id}`, { adminUserId: session.userId });
    await logAdminAction(session.userId, 'create', 'studio', studio.id, { name: studio.name, city: studio.city });

    return NextResponse.json({ studio }, { status: 201 });
  } catch (error) {
    logger.error('admin/studios', 'Failed to create studio', error);
    return NextResponse.json({ error: 'Failed to create studio' }, { status: 500 });
  }
}
