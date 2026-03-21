import { stat } from 'fs/promises';
import path from 'path';
import { prisma } from '@/lib/db';
import { getUploadsBasePath } from '@/lib/uploads';

/** 500 MB per user */
export const MAX_STORAGE_PER_USER = 500 * 1024 * 1024;

/**
 * Resolve a public URL (e.g. /uploads/ugc/images/2024/01/abc.jpg) to an
 * absolute filesystem path using the same base directory logic as uploads.ts.
 */
function resolveUploadPath(publicUrl: string): string {
  // publicUrl starts with "/uploads/..." — strip the leading "/uploads/" and
  // join with the uploads base directory.
  const relative = publicUrl.replace(/^\/uploads\//, '');
  return path.join(getUploadsBasePath(), relative);
}

/**
 * Calculate total bytes used by a user across UGC posts and workout log images.
 */
export async function getUserStorageUsage(userId: string): Promise<number> {
  // Fetch local-upload media URLs (exclude instagram posts which have no local file)
  const [ugcPosts, workoutLogs] = await Promise.all([
    prisma.ugcPost.findMany({
      where: {
        userId,
        mediaUrl: { not: null },
        // Only count local uploads (mediaType image or video, not instagram)
        mediaType: { not: 'instagram' },
      },
      select: { mediaUrl: true },
    }),
    prisma.workoutLog.findMany({
      where: {
        userId,
        imageUrl: { not: null },
      },
      select: { imageUrl: true },
    }),
  ]);

  const filePaths: string[] = [];

  for (const post of ugcPosts) {
    if (post.mediaUrl) {
      filePaths.push(resolveUploadPath(post.mediaUrl));
    }
  }

  for (const log of workoutLogs) {
    if (log.imageUrl) {
      filePaths.push(resolveUploadPath(log.imageUrl));
    }
  }

  // Sum file sizes, skipping any that are missing on disk
  let totalBytes = 0;
  for (const fp of filePaths) {
    try {
      const stats = await stat(fp);
      totalBytes += stats.size;
    } catch {
      // File missing or inaccessible — skip it
    }
  }

  return totalBytes;
}

/**
 * Check whether a user is within their upload storage cap.
 */
export async function checkUserStorageLimit(
  userId: string
): Promise<{ allowed: boolean; usedBytes: number; limitBytes: number }> {
  const usedBytes = await getUserStorageUsage(userId);
  return {
    allowed: usedBytes < MAX_STORAGE_PER_USER,
    usedBytes,
    limitBytes: MAX_STORAGE_PER_USER,
  };
}
