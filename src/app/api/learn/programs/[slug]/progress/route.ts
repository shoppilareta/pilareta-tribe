import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getSession(request);
    if (!session?.userId) {
      return NextResponse.json({ progress: null });
    }

    const { slug } = await params;

    const program = await prisma.program.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!program) {
      return NextResponse.json({ progress: null });
    }

    const progress = await prisma.userProgramProgress.findFirst({
      where: {
        userId: session.userId,
        programId: program.id,
      },
      orderBy: { startedAt: 'desc' },
      select: {
        currentWeek: true,
        completedSessionIds: true,
        status: true,
      },
    });

    return NextResponse.json({ progress: progress ?? null });
  } catch (error) {
    console.error('Error fetching program progress:', error);
    return NextResponse.json({ progress: null });
  }
}
