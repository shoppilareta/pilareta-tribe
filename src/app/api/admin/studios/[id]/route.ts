import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { logger } from '@/lib/logger';

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

    const updateData: Record<string, unknown> = {};
    if (body.verified !== undefined) updateData.verified = body.verified;
    if (body.name !== undefined) updateData.name = body.name;
    if (body.city !== undefined) updateData.city = body.city;
    if (body.address !== undefined) updateData.address = body.address;
    if (body.phoneNumber !== undefined) updateData.phoneNumber = body.phoneNumber;
    if (body.website !== undefined) updateData.website = body.website;

    const studio = await prisma.studio.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ studio });
  } catch (error) {
    logger.error('admin/studios', 'Failed to update studio', error);
    return NextResponse.json({ error: 'Failed to update studio' }, { status: 500 });
  }
}
