import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { logAdminAction } from '@/lib/admin/audit';

// GET /api/admin/exercises - List all exercises
export async function GET(request: NextRequest) {
  try {
    const session = await getSession(request);
    if (!session?.isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';

    const exercises = await prisma.exercise.findMany({
      where: search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { slug: { contains: search, mode: 'insensitive' } },
            ],
          }
        : undefined,
      orderBy: { name: 'asc' },
      select: {
        id: true,
        slug: true,
        name: true,
        equipment: true,
        difficulty: true,
        videoUrl: true,
        imageUrl: true,
        isVerified: true,
        focusAreas: true,
      },
    });

    return NextResponse.json({ exercises });
  } catch (error) {
    logger.error('admin/exercises', 'Failed to fetch exercises', error);
    return NextResponse.json({ error: 'Failed to fetch exercises' }, { status: 500 });
  }
}

// POST /api/admin/exercises - Create a new exercise
export async function POST(request: NextRequest) {
  try {
    const session = await getSession(request);
    if (!session?.isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();

    // Validate required fields
    if (!body.name || !body.slug || !body.equipment || !body.difficulty) {
      return NextResponse.json(
        { error: 'Missing required fields: name, slug, equipment, difficulty' },
        { status: 400 }
      );
    }

    // Check for duplicate slug
    const existing = await prisma.exercise.findUnique({ where: { slug: body.slug } });
    if (existing) {
      return NextResponse.json({ error: 'An exercise with this slug already exists' }, { status: 409 });
    }

    const exercise = await prisma.exercise.create({
      data: {
        name: body.name,
        slug: body.slug,
        description: body.description || '',
        equipment: body.equipment,
        difficulty: body.difficulty,
        focusAreas: body.focusAreas || [],
        setupSteps: body.setupSteps || [],
        executionSteps: body.executionSteps || [],
        cues: body.cues || [],
        commonMistakes: body.commonMistakes || [],
        modifications: body.modifications || { easier: [], harder: [] },
        contraindications: body.contraindications || [],
        safetyNotes: body.safetyNotes || null,
        primaryMuscles: body.primaryMuscles || [],
        secondaryMuscles: body.secondaryMuscles || [],
        defaultReps: body.defaultReps ?? null,
        defaultDuration: body.defaultDuration ?? null,
        defaultSets: body.defaultSets ?? 1,
        defaultTempo: body.defaultTempo || null,
        rpeTarget: body.rpeTarget ?? 5,
        springSuggestion: body.springSuggestion || null,
        imageUrl: body.imageUrl || null,
        videoUrl: body.videoUrl || null,
        instructorNotes: body.instructorNotes || null,
        isVerified: body.isVerified ?? false,
      },
    });

    logger.info('admin/exercises', `Created exercise ${exercise.id}`, { adminUserId: session.userId });
    await logAdminAction(session.userId, 'create', 'exercise', exercise.id, { name: exercise.name, slug: exercise.slug });

    return NextResponse.json({ exercise }, { status: 201 });
  } catch (error) {
    logger.error('admin/exercises', 'Failed to create exercise', error);
    return NextResponse.json({ error: 'Failed to create exercise' }, { status: 500 });
  }
}
