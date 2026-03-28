import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';

export async function GET() {
  try {
    const programs = await prisma.program.findMany({
      where: { isPublished: true },
      orderBy: [
        { level: 'asc' },
        { name: 'asc' },
      ],
    });

    return NextResponse.json({ programs });
  } catch (error) {
    logger.error('learn/programs', 'Failed to fetch programs', error);
    return NextResponse.json(
      { error: 'Failed to fetch programs' },
      { status: 500 }
    );
  }
}
