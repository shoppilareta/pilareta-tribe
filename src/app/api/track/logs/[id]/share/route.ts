import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// POST /api/track/logs/[id]/share - Share workout to Community
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession(request);
    if (!session?.userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { id } = await params;

    // Get the workout log
    const log = await prisma.workoutLog.findUnique({
      where: { id },
      include: {
        studio: {
          select: {
            id: true,
            name: true,
          },
        },
        session: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!log) {
      return NextResponse.json({ error: 'Workout log not found' }, { status: 404 });
    }

    if (log.userId !== session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    if (log.isShared && log.sharedPostId) {
      return NextResponse.json(
        { error: 'This workout has already been shared' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { caption } = body;

    // Generate default caption if not provided
    let finalCaption = caption;
    if (!finalCaption) {
      const parts: string[] = [];
      parts.push(`${log.durationMinutes}-min ${log.workoutType} workout`);

      if (log.studio) {
        parts.push(`at ${log.studio.name}`);
      } else if (log.session) {
        parts.push(`- ${log.session.name}`);
      }

      // Get user's current streak
      const stats = await prisma.userWorkoutStats.findUnique({
        where: { userId: session.userId },
      });

      if (stats && stats.currentStreak > 1) {
        parts.push(`\n\n${stats.currentStreak}-day streak 🔥`);
      }

      finalCaption = parts.join(' ');
    }

    // Create the UGC post
    // If the workout log has an image, use it as the media
    const post = await prisma.ugcPost.create({
      data: {
        userId: session.userId,
        caption: finalCaption,
        studioId: log.studioId,
        mediaUrl: log.imageUrl || null,
        mediaType: log.imageUrl ? 'image' : 'image', // Always 'image' for display purposes
        postType: 'workout_recap',
        consentGiven: true,
        consentTimestamp: new Date(),
        status: 'approved', // Auto-approve workout recaps (no external media)
      },
    });

    // Update the workout log with the shared post reference
    await prisma.workoutLog.update({
      where: { id },
      data: {
        isShared: true,
        sharedPostId: post.id,
      },
    });

    return NextResponse.json({
      success: true,
      post,
      message: 'Workout shared to Community!',
    });
  } catch (error) {
    console.error('Error sharing workout:', error);
    return NextResponse.json({ error: 'Failed to share workout' }, { status: 500 });
  }
}

// DELETE /api/track/logs/[id]/share - Unshare workout from Community
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession(request);
    if (!session?.userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { id } = await params;

    const log = await prisma.workoutLog.findUnique({
      where: { id },
    });

    if (!log) {
      return NextResponse.json({ error: 'Workout log not found' }, { status: 404 });
    }

    if (log.userId !== session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    if (!log.isShared || !log.sharedPostId) {
      return NextResponse.json(
        { error: 'This workout has not been shared' },
        { status: 400 }
      );
    }

    // Delete the shared post
    await prisma.ugcPost.delete({
      where: { id: log.sharedPostId },
    });

    // Update the workout log
    await prisma.workoutLog.update({
      where: { id },
      data: {
        isShared: false,
        sharedPostId: null,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Workout unshared from Community',
    });
  } catch (error) {
    console.error('Error unsharing workout:', error);
    return NextResponse.json({ error: 'Failed to unshare workout' }, { status: 500 });
  }
}
