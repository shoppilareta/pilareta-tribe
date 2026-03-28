import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { logger } from '@/lib/logger';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getSession(request);
    if (!session?.userId) {
      return NextResponse.json({ completionCount: 0, lastCompletedAt: null });
    }

    const { slug } = await params;

    // Find the exercise by slug
    const exercise = await prisma.exercise.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!exercise) {
      return NextResponse.json({ completionCount: 0, lastCompletedAt: null });
    }

    // Count completions for this exercise by this user
    const completions = await prisma.userExerciseCompletion.findMany({
      where: {
        userId: session.userId,
        sessionItem: {
          exerciseId: exercise.id,
        },
      },
      orderBy: { completedAt: 'desc' },
      select: { completedAt: true },
    });

    return NextResponse.json({
      completionCount: completions.length,
      lastCompletedAt: completions[0]?.completedAt?.toISOString() ?? null,
    });
  } catch (error) {
    logger.error('learn/exercises/stats', 'Failed to fetch exercise completion stats', error);
    return NextResponse.json({ completionCount: 0, lastCompletedAt: null });
  }
}
