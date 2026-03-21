import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    await prisma.$queryRaw(Prisma.sql`SELECT 1`);

    return NextResponse.json({
      status: 'ok',
      db: 'connected',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';

    return NextResponse.json(
      {
        status: 'degraded',
        db: 'disconnected',
        error: message,
      },
      { status: 503 },
    );
  }
}
