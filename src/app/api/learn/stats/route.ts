import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const [exerciseCount, programCount, programs] = await Promise.all([
      prisma.exercise.count(),
      prisma.program.count({ where: { isPublished: true } }),
      prisma.program.findMany({
        where: { isPublished: true },
        select: {
          durationWeeks: true,
          sessionsPerWeek: true,
        },
      }),
    ]);

    // Calculate total weeks and sessions across all programs
    const totalWeeks = programs.reduce((sum, p) => sum + p.durationWeeks, 0);
    const totalSessions = programs.reduce(
      (sum, p) => sum + p.durationWeeks * p.sessionsPerWeek,
      0
    );

    return NextResponse.json({
      exercises: exerciseCount,
      programs: programCount,
      weeks: totalWeeks,
      sessions: totalSessions,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
