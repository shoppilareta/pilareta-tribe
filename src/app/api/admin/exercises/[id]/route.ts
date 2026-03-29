import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { logAdminAction } from '@/lib/admin/audit';

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

// PATCH /api/admin/exercises/[id] - Update exercise (all fields)
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
      // Core fields
      'name',
      'slug',
      'description',
      'equipment',
      'difficulty',
      'focusAreas',
      // Execution details
      'setupSteps',
      'executionSteps',
      'cues',
      'commonMistakes',
      'modifications',
      // Safety
      'contraindications',
      'safetyNotes',
      // Muscles
      'primaryMuscles',
      'secondaryMuscles',
      // Session params
      'defaultReps',
      'defaultDuration',
      'defaultSets',
      'defaultTempo',
      'rpeTarget',
      'springSuggestion',
      // Media
      'imageUrl',
      'videoUrl',
      'videoTimestamps',
      'multiAngleVideos',
      'animation3dId',
      // Meta
      'instructorNotes',
      'isVerified',
    ];

    const updateData: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    // If slug is being changed, check for duplicates
    if (updateData.slug && updateData.slug !== exercise.slug) {
      const existing = await prisma.exercise.findUnique({ where: { slug: updateData.slug as string } });
      if (existing) {
        return NextResponse.json({ error: 'An exercise with this slug already exists' }, { status: 409 });
      }
    }

    const updated = await prisma.exercise.update({
      where: { id },
      data: updateData,
    });

    logger.info('admin/exercises', `Updated exercise ${id}`, { adminUserId: session.userId });
    await logAdminAction(session.userId, 'update', 'exercise', id, { updatedFields: Object.keys(updateData) });

    return NextResponse.json({ success: true, exercise: updated });
  } catch (error) {
    logger.error('admin/exercises', 'Failed to update exercise', error);
    return NextResponse.json({ error: 'Failed to update exercise' }, { status: 500 });
  }
}

// DELETE /api/admin/exercises/[id] - Delete exercise
export async function DELETE(request: NextRequest, { params }: RouteParams) {
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

    await prisma.exercise.delete({ where: { id } });

    logger.info('admin/exercises', `Deleted exercise ${id} (${exercise.name})`, { adminUserId: session.userId });
    await logAdminAction(session.userId, 'delete', 'exercise', id, { name: exercise.name });

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('admin/exercises', 'Failed to delete exercise', error);
    return NextResponse.json({ error: 'Failed to delete exercise' }, { status: 500 });
  }
}
