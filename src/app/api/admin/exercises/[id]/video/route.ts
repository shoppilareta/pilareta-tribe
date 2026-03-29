import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

// TODO: Add ffmpeg compression for uploaded videos to optimize file size and
// ensure consistent codec (H.264/AAC). For now, videos are stored as-is and
// the browser/mobile player handles codec compatibility.

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession(request);
  if (!session?.isAdmin) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  const { id } = await params;
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

  // Save to uploads directory
  const uploadsDir = '/var/data/pilareta-uploads/exercises/videos';
  await mkdir(uploadsDir, { recursive: true });

  const ext = video.name.split('.').pop() || 'mp4';
  const filename = `${id}.${ext}`;
  const filepath = path.join(uploadsDir, filename);

  const buffer = Buffer.from(await video.arrayBuffer());
  await writeFile(filepath, buffer);

  // Update exercise with video URL
  const videoUrl = `/uploads/exercises/videos/${filename}`;
  await prisma.exercise.update({
    where: { id },
    data: { videoUrl },
  });

  return NextResponse.json({ videoUrl });
}
