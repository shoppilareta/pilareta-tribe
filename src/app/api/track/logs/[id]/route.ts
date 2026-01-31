import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { updateUserStats } from '@/lib/track/streak';
import { estimateCalories, isValidRpe, isValidDuration, isValidWorkoutType } from '@/lib/track/calories';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/track/logs/[id] - Get single workout log
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession(request);
    if (!session?.userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { id } = await params;

    const log = await prisma.workoutLog.findUnique({
      where: { id },
      include: {
        session: {
          select: {
            id: true,
            name: true,
            durationMinutes: true,
          },
        },
        studio: {
          select: {
            id: true,
            name: true,
            city: true,
          },
        },
        sharedPost: {
          select: {
            id: true,
            status: true,
          },
        },
      },
    });

    if (!log) {
      return NextResponse.json({ error: 'Workout log not found' }, { status: 404 });
    }

    // Only allow viewing own logs
    if (log.userId !== session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    return NextResponse.json({ log });
  } catch (error) {
    console.error('Error fetching workout log:', error);
    return NextResponse.json({ error: 'Failed to fetch workout log' }, { status: 500 });
  }
}

// PATCH /api/track/logs/[id] - Update workout log
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession(request);
    if (!session?.userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { id } = await params;

    // Check log exists and belongs to user
    const existingLog = await prisma.workoutLog.findUnique({
      where: { id },
    });

    if (!existingLog) {
      return NextResponse.json({ error: 'Workout log not found' }, { status: 404 });
    }

    if (existingLog.userId !== session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const {
      workoutDate,
      durationMinutes,
      workoutType,
      rpe,
      notes,
      focusAreas,
      studioId,
      customStudioName,
      calorieEstimate,
    } = body;

    // Build update data
    const updateData: Record<string, unknown> = {};

    if (workoutDate !== undefined) {
      const parsedDate = new Date(workoutDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      if (parsedDate > today) {
        return NextResponse.json(
          { error: 'Cannot log workouts in the future' },
          { status: 400 }
        );
      }

      if (parsedDate < sevenDaysAgo) {
        return NextResponse.json(
          { error: 'Can only backfill workouts up to 7 days' },
          { status: 400 }
        );
      }

      parsedDate.setHours(0, 0, 0, 0);
      updateData.workoutDate = parsedDate;
    }

    if (durationMinutes !== undefined) {
      if (!isValidDuration(durationMinutes)) {
        return NextResponse.json(
          { error: 'Duration must be between 1 and 180 minutes' },
          { status: 400 }
        );
      }
      updateData.durationMinutes = durationMinutes;
    }

    if (workoutType !== undefined) {
      if (!isValidWorkoutType(workoutType)) {
        return NextResponse.json(
          { error: 'Invalid workout type' },
          { status: 400 }
        );
      }
      updateData.workoutType = workoutType.toLowerCase();
    }

    if (rpe !== undefined) {
      if (!isValidRpe(rpe)) {
        return NextResponse.json(
          { error: 'RPE must be between 1 and 10' },
          { status: 400 }
        );
      }
      updateData.rpe = rpe;
    }

    if (notes !== undefined) {
      updateData.notes = notes || null;
    }

    if (focusAreas !== undefined) {
      updateData.focusAreas = focusAreas;
    }

    if (studioId !== undefined) {
      if (studioId) {
        const studioExists = await prisma.studio.findUnique({
          where: { id: studioId },
        });
        if (!studioExists) {
          return NextResponse.json({ error: 'Studio not found' }, { status: 404 });
        }
        // Clear custom studio name if selecting a database studio
        updateData.customStudioName = null;
      }
      updateData.studioId = studioId || null;
    }

    if (customStudioName !== undefined) {
      updateData.customStudioName = customStudioName || null;
      // Clear studio ID if using custom studio name
      if (customStudioName) {
        updateData.studioId = null;
      }
    }

    // Recalculate calories if relevant fields changed
    if (durationMinutes !== undefined || workoutType !== undefined || rpe !== undefined) {
      const finalDuration = durationMinutes ?? existingLog.durationMinutes;
      const finalType = workoutType?.toLowerCase() ?? existingLog.workoutType;
      const finalRpe = rpe ?? existingLog.rpe;
      updateData.calorieEstimate = calorieEstimate || estimateCalories(finalDuration, finalType, finalRpe);
    } else if (calorieEstimate !== undefined) {
      updateData.calorieEstimate = calorieEstimate;
    }

    const updatedLog = await prisma.workoutLog.update({
      where: { id },
      data: updateData,
      include: {
        session: {
          select: {
            id: true,
            name: true,
          },
        },
        studio: {
          select: {
            id: true,
            name: true,
            city: true,
          },
        },
      },
    });

    // Update user stats
    await updateUserStats(session.userId);

    return NextResponse.json({
      success: true,
      log: updatedLog,
    });
  } catch (error) {
    console.error('Error updating workout log:', error);
    return NextResponse.json({ error: 'Failed to update workout log' }, { status: 500 });
  }
}

// DELETE /api/track/logs/[id] - Delete workout log
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession(request);
    if (!session?.userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { id } = await params;

    // Check log exists and belongs to user
    const existingLog = await prisma.workoutLog.findUnique({
      where: { id },
      include: {
        sharedPost: true,
      },
    });

    if (!existingLog) {
      return NextResponse.json({ error: 'Workout log not found' }, { status: 404 });
    }

    if (existingLog.userId !== session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // If there's a shared post, unlink it but don't delete
    if (existingLog.sharedPostId) {
      await prisma.ugcPost.update({
        where: { id: existingLog.sharedPostId },
        data: { postType: 'general' }, // Convert to regular post
      });
    }

    // Delete the log
    await prisma.workoutLog.delete({
      where: { id },
    });

    // Update user stats
    await updateUserStats(session.userId);

    return NextResponse.json({
      success: true,
      message: 'Workout log deleted',
    });
  } catch (error) {
    console.error('Error deleting workout log:', error);
    return NextResponse.json({ error: 'Failed to delete workout log' }, { status: 500 });
  }
}
