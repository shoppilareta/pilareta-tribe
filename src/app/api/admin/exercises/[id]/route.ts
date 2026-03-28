import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { logger } from '@/lib/logger';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/admin/exercises/[id]
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession(request);
    if (!session?.isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { id } = await params;
    const exercise = await prisma.exercise.findUnique({ where: { id } });

    if (!exercise) {
      return NextResponse.json({ error: 'Exercise not found' }, { status: 404 });
    }

    return NextResponse.json({ exercise });
  } catch (error) {
    logger.error('admin/exercises', 'Failed to fetch exercise', error);
    return NextResponse.json({ error: 'Failed to fetch exercise' }, { status: 500 });
  }
}

// PATCH /api/admin/exercises/[id] - Update exercise (video, image, verification)
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession(request);
    if (!session?.isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();

    const exercise = await prisma.exercise.findUnique({ where: { id } });
    if (!exercise) {
      return NextResponse.json({ error: 'Exercise not found' }, { status: 404 });
    }

    const allowedFields = [
      'videoUrl',
      'imageUrl',
      'videoTimestamps',
      'multiAngleVideos',
      'isVerified',
      'instructorNotes',
    ];

    const updateData: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    const updated = await prisma.exercise.update({
      where: { id },
      data: updateData,
    });

    logger.info('admin/exercises', `Updated exercise ${id}`, { adminUserId: session.userId });

    return NextResponse.json({ success: true, exercise: updated });
  } catch (error) {
    logger.error('admin/exercises', 'Failed to update exercise', error);
    return NextResponse.json({ error: 'Failed to update exercise' }, { status: 500 });
  }
}
