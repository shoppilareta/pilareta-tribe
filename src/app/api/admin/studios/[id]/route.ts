import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { logAdminAction } from '@/lib/admin/audit';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// PATCH /api/admin/studios/[id] — Update studio (admin only)
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession(request);
    if (!session?.userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    const user = await prisma.user.findUnique({ where: { id: session.userId } });
    if (!user?.isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();

    const studio = await prisma.studio.findUnique({ where: { id } });
    if (!studio) {
      return NextResponse.json({ error: 'Studio not found' }, { status: 404 });
    }

    const allowedFields = [
      'name',
      'city',
      'address',
      'latitude',
      'longitude',
      'phoneNumber',
      'website',
      'amenities',
      'openingHours',
      'rating',
      'verified',
    ];

    const updateData: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    const updated = await prisma.studio.update({
      where: { id },
      data: updateData,
    });

    logger.info('admin/studios', `Updated studio ${id}`, { adminUserId: session.userId });
    await logAdminAction(session.userId, 'update', 'studio', id, { updatedFields: Object.keys(updateData) });

    return NextResponse.json({ studio: updated });
  } catch (error) {
    logger.error('admin/studios', 'Failed to update studio', error);
    return NextResponse.json({ error: 'Failed to update studio' }, { status: 500 });
  }
}

// DELETE /api/admin/studios/[id] — Delete studio (admin only)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession(request);
    if (!session?.userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    const user = await prisma.user.findUnique({ where: { id: session.userId } });
    if (!user?.isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { id } = await params;

    const studio = await prisma.studio.findUnique({ where: { id } });
    if (!studio) {
      return NextResponse.json({ error: 'Studio not found' }, { status: 404 });
    }

    await prisma.studio.delete({ where: { id } });

    logger.info('admin/studios', `Deleted studio ${id} (${studio.name})`, { adminUserId: session.userId });
    await logAdminAction(session.userId, 'delete', 'studio', id, { name: studio.name });

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('admin/studios', 'Failed to delete studio', error);
    return NextResponse.json({ error: 'Failed to delete studio' }, { status: 500 });
  }
}
