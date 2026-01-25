import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { updateUserStats } from '@/lib/track/streak';
import { estimateCalories, isValidRpe, isValidDuration, isValidWorkoutType } from '@/lib/track/calories';

// GET /api/track/logs - List user's workout logs
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get('cursor');
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const where: Record<string, unknown> = {
      userId: session.userId,
    };

    // Date range filtering for calendar view
    if (startDate || endDate) {
      where.workoutDate = {};
      if (startDate) {
        (where.workoutDate as Record<string, Date>).gte = new Date(startDate);
      }
      if (endDate) {
        (where.workoutDate as Record<string, Date>).lte = new Date(endDate);
      }
    }

    const logs = await prisma.workoutLog.findMany({
      where,
      take: limit + 1,
      ...(cursor && {
        cursor: { id: cursor },
        skip: 1,
      }),
      orderBy: { workoutDate: 'desc' },
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
        sharedPost: {
          select: {
            id: true,
            status: true,
          },
        },
      },
    });

    const hasMore = logs.length > limit;
    const items = hasMore ? logs.slice(0, limit) : logs;
    const nextCursor = hasMore ? items[items.length - 1]?.id : null;

    return NextResponse.json({
      logs: items,
      nextCursor,
      hasMore,
    });
  } catch (error) {
    console.error('Error fetching workout logs:', error);
    return NextResponse.json({ error: 'Failed to fetch workout logs' }, { status: 500 });
  }
}

// POST /api/track/logs - Create workout log
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const {
      workoutDate,
      durationMinutes,
      workoutType,
      rpe,
      notes,
      focusAreas,
      sessionId,
      studioId,
      calorieEstimate,
    } = body;

    // Validation
    if (!durationMinutes || !workoutType || !rpe) {
      return NextResponse.json(
        { error: 'Duration, workout type, and RPE are required' },
        { status: 400 }
      );
    }

    if (!isValidDuration(durationMinutes)) {
      return NextResponse.json(
        { error: 'Duration must be between 1 and 180 minutes' },
        { status: 400 }
      );
    }

    if (!isValidRpe(rpe)) {
      return NextResponse.json(
        { error: 'RPE must be between 1 and 10' },
        { status: 400 }
      );
    }

    if (!isValidWorkoutType(workoutType)) {
      return NextResponse.json(
        { error: 'Invalid workout type' },
        { status: 400 }
      );
    }

    // Parse workout date (allow backfilling up to 7 days)
    let parsedDate: Date;
    if (workoutDate) {
      parsedDate = new Date(workoutDate);
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
    } else {
      parsedDate = new Date();
    }
    parsedDate.setHours(0, 0, 0, 0);

    // Validate session exists if provided
    if (sessionId) {
      const sessionExists = await prisma.pilatesSession.findUnique({
        where: { id: sessionId },
      });
      if (!sessionExists) {
        return NextResponse.json({ error: 'Session not found' }, { status: 404 });
      }
    }

    // Validate studio exists if provided
    if (studioId) {
      const studioExists = await prisma.studio.findUnique({
        where: { id: studioId },
      });
      if (!studioExists) {
        return NextResponse.json({ error: 'Studio not found' }, { status: 404 });
      }
    }

    // Calculate calorie estimate if not provided
    const calories = calorieEstimate || estimateCalories(durationMinutes, workoutType, rpe);

    // Create the workout log
    const log = await prisma.workoutLog.create({
      data: {
        userId: session.userId,
        workoutDate: parsedDate,
        durationMinutes,
        workoutType: workoutType.toLowerCase(),
        rpe,
        notes: notes || null,
        focusAreas: focusAreas || [],
        sessionId: sessionId || null,
        studioId: studioId || null,
        calorieEstimate: calories,
      },
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

    // Update user stats (streak, totals, etc.)
    await updateUserStats(session.userId);

    return NextResponse.json({
      success: true,
      log,
      message: 'Workout logged successfully',
    });
  } catch (error) {
    console.error('Error creating workout log:', error);
    return NextResponse.json({ error: 'Failed to create workout log' }, { status: 500 });
  }
}
