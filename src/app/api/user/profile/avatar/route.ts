import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { getUploadsBasePath } from '@/lib/uploads';
import { logger } from '@/lib/logger';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

function getAvatarUploadsPath(): string {
  return path.join(getUploadsBasePath(), 'avatars');
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession(request);
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('avatar') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No avatar file provided' }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Only JPEG, PNG, and WebP images are allowed' },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: 'Image too large. Maximum size: 5MB' },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = file.type === 'image/png' ? '.png' : file.type === 'image/webp' ? '.webp' : '.jpg';
    const fileName = `${session.userId}${ext}`;
    const uploadsDir = getAvatarUploadsPath();
    const absolutePath = path.join(uploadsDir, fileName);

    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    await writeFile(absolutePath, buffer);

    const avatarUrl = `/uploads/avatars/${fileName}?t=${Date.now()}`;

    const profile = await prisma.userProfile.upsert({
      where: { userId: session.userId },
      update: { avatarUrl },
      create: { userId: session.userId, avatarUrl },
    });

    return NextResponse.json({ profile });
  } catch (error) {
    logger.error('user/profile/avatar', 'Failed to upload avatar', error);
    return NextResponse.json(
      { error: 'Failed to upload avatar' },
      { status: 500 }
    );
  }
}
