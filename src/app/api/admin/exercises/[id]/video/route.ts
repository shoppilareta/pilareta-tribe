import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { getExerciseVideosPath } from '@/lib/uploads';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession(request);
  if (!session?.isAdmin) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  const { id } = await params;

  // Verify exercise exists
  const exercise = await prisma.exercise.findUnique({ where: { id } });
  if (!exercise) {
    return NextResponse.json({ error: 'Exercise not found' }, { status: 404 });
  }

  const formData = await request.formData();
  const video = formData.get('video') as File;

  if (!video) {
    return NextResponse.json({ error: 'Video file required' }, { status: 400 });
  }

  // Validate file type
  const allowedTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-m4v'];
  if (!allowedTypes.includes(video.type)) {
    return NextResponse.json({ error: 'Invalid video type. Use MP4, WebM, or MOV.' }, { status: 400 });
  }

  // Max 100MB
  if (video.size > 100 * 1024 * 1024) {
    return NextResponse.json({ error: 'Video too large (max 100MB)' }, { status: 400 });
  }

  try {
    const uploadsDir = getExerciseVideosPath();
    await mkdir(uploadsDir, { recursive: true });

    const ext = video.name.split('.').pop()?.toLowerCase() || 'mp4';
    const filename = `${id}.${ext}`;
    const filepath = path.join(uploadsDir, filename);

    const buffer = Buffer.from(await video.arrayBuffer());
    await writeFile(filepath, buffer);

    // Store URL with /api/uploads/ prefix so the serving route handles it
    const videoUrl = `/api/uploads/exercises/videos/${filename}`;
    await prisma.exercise.update({
      where: { id },
      data: { videoUrl },
    });

    logger.info('admin/exercises/video', `Video uploaded for exercise ${exercise.slug}`, {
      size: video.size,
      type: video.type,
      filename,
    });

    return NextResponse.json({ videoUrl });
  } catch (error) {
    logger.error('admin/exercises/video', 'Video upload failed', error);
    return NextResponse.json({ error: 'Video upload failed' }, { status: 500 });
  }
}
