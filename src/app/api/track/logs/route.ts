import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { updateUserStats } from '@/lib/track/streak';
import { estimateCalories, isValidRpe, isValidDuration, isValidWorkoutType } from '@/lib/track/calories';
import { saveWorkoutImage } from '@/lib/track/upload';

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

    // Check content type to determine how to parse
    const contentType = request.headers.get('content-type') || '';

    let workoutDate: string | undefined;
    let durationMinutes: number;
    let workoutType: string;
    let rpe: number;
    let notes: string | undefined;
    let focusAreas: string[] | undefined;
    let sessionId: string | undefined;
    let studioId: string | undefined;
    let calorieEstimate: number | undefined;
    let imageFile: File | null = null;

    if (contentType.includes('multipart/form-data')) {
      // Handle form data with potential image
      const formData = await request.formData();
      workoutDate = formData.get('workoutDate') as string | undefined;
      durationMinutes = parseInt(formData.get('durationMinutes') as string, 10);
      workoutType = formData.get('workoutType') as string;
      rpe = parseInt(formData.get('rpe') as string, 10);
      notes = formData.get('notes') as string | undefined;
      sessionId = formData.get('sessionId') as string | undefined;
      studioId = formData.get('studioId') as string | undefined;
      const calorieStr = formData.get('calorieEstimate') as string | undefined;
      calorieEstimate = calorieStr ? parseInt(calorieStr, 10) : undefined;

      const focusAreasStr = formData.get('focusAreas') as string | undefined;
      if (focusAreasStr) {
        try {
          focusAreas = JSON.parse(focusAreasStr);
        } catch {
          focusAreas = undefined;
        }
      }

      imageFile = formData.get('image') as File | null;
    } else {
      // Handle JSON body (backwards compatible)
      const body = await request.json();
      workoutDate = body.workoutDate;
      durationMinutes = body.durationMinutes;
      workoutType = body.workoutType;
      rpe = body.rpe;
      notes = body.notes;
      focusAreas = body.focusAreas;
      sessionId = body.sessionId;
      studioId = body.studioId;
      calorieEstimate = body.calorieEstimate;
    }

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
    });

    // Handle image upload if provided
    let imageUrl: string | null = null;
    if (imageFile && imageFile.size > 0) {
      const buffer = Buffer.from(await imageFile.arrayBuffer());
      const uploadResult = await saveWorkoutImage(log.id, buffer, imageFile.type);

      if (uploadResult.success && uploadResult.imageUrl) {
        imageUrl = uploadResult.imageUrl;
        // Update the log with the image URL
        await prisma.workoutLog.update({
          where: { id: log.id },
          data: { imageUrl },
        });
      }
    }

    // Get the full log with relations
    const fullLog = await prisma.workoutLog.findUnique({
      where: { id: log.id },
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
      log: fullLog,
      message: 'Workout logged successfully',
    });
  } catch (error) {
    console.error('Error creating workout log:', error);
    return NextResponse.json({ error: 'Failed to create workout log' }, { status: 500 });
  }
}
