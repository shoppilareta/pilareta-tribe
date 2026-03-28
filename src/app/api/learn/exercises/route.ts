import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';

export async function GET() {
  try {
    const exercises = await prisma.exercise.findMany({
      orderBy: [
        { difficulty: 'asc' },
        { name: 'asc' },
      ],
    });

    return NextResponse.json({ exercises });
  } catch (error) {
    logger.error('learn/exercises', 'Failed to fetch exercises', error);
    return NextResponse.json(
      { error: 'Failed to fetch exercises' },
      { status: 500 }
    );
  }
}
