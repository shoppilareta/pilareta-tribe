import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { prisma } from '@/lib/db';
import {
  validateContentType,
  validateFileSize,
  getExtensionFromContentType,
} from './validation';

const UPLOAD_BASE_PATH = process.env.NODE_ENV === 'production'
  ? '/var/www/pilareta-tribe/public/uploads/ugc'
  : path.join(process.cwd(), 'public/uploads/ugc');

const PUBLIC_URL_BASE = '/uploads/ugc';

// Rate limiting: 5 uploads per hour, 20 per day
const HOURLY_LIMIT = 5;
const DAILY_LIMIT = 20;

export interface UploadResult {
  success: boolean;
  error?: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  fileSizeBytes?: number;
}

/**
 * Check if user has exceeded upload rate limits
 * Admins are exempt from rate limits
 */
export async function checkUploadRateLimit(
  userId: string,
  isAdmin: boolean = false
): Promise<{ allowed: boolean; error?: string }> {
  // Admins are exempt from rate limits
  if (isAdmin) {
    return { allowed: true };
  }

  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const [hourlyCount, dailyCount] = await Promise.all([
    prisma.ugcPost.count({
      where: {
        userId,
        createdAt: { gte: oneHourAgo },
      },
    }),
    prisma.ugcPost.count({
      where: {
        userId,
        createdAt: { gte: oneDayAgo },
      },
    }),
  ]);

  if (hourlyCount >= HOURLY_LIMIT) {
    return {
      allowed: false,
      error: `Upload limit reached. You can upload ${HOURLY_LIMIT} posts per hour.`,
    };
  }

  if (dailyCount >= DAILY_LIMIT) {
    return {
      allowed: false,
      error: `Daily upload limit reached. You can upload ${DAILY_LIMIT} posts per day.`,
    };
  }

  return { allowed: true };
}

/**
 * Generate file path for upload
 */
function generateFilePath(postId: string, mediaType: 'image' | 'video', extension: string): {
  absolutePath: string;
  publicUrl: string;
} {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');

  const folder = mediaType === 'image' ? 'images' : 'videos';
  const relativePath = `${folder}/${year}/${month}`;
  const fileName = `${postId}${extension}`;

  return {
    absolutePath: path.join(UPLOAD_BASE_PATH, relativePath, fileName),
    publicUrl: `${PUBLIC_URL_BASE}/${relativePath}/${fileName}`,
  };
}

/**
 * Ensure upload directory exists
 */
async function ensureDirectoryExists(filePath: string): Promise<void> {
  const dir = path.dirname(filePath);
  if (!existsSync(dir)) {
    await mkdir(dir, { recursive: true });
  }
}

/**
 * Save uploaded file to local storage
 */
export async function saveUploadedFile(
  postId: string,
  fileBuffer: Buffer,
  contentType: string
): Promise<UploadResult> {
  // Validate content type
  const typeValidation = validateContentType(contentType);
  if (!typeValidation.valid) {
    return { success: false, error: typeValidation.error };
  }

  const mediaType = typeValidation.mediaType!;

  // Validate file size
  const sizeValidation = validateFileSize(fileBuffer.length, mediaType);
  if (!sizeValidation.valid) {
    return { success: false, error: sizeValidation.error };
  }

  // Generate file path
  const extension = getExtensionFromContentType(contentType);
  const { absolutePath, publicUrl } = generateFilePath(postId, mediaType, extension);

  try {
    // Ensure directory exists
    await ensureDirectoryExists(absolutePath);

    // Write file
    await writeFile(absolutePath, fileBuffer);

    return {
      success: true,
      mediaUrl: publicUrl,
      mediaType,
      fileSizeBytes: fileBuffer.length,
    };
  } catch (error) {
    console.error('Error saving file:', error);
    return {
      success: false,
      error: 'Failed to save file',
    };
  }
}

/**
 * Get image dimensions from buffer (basic implementation)
 * For production, consider using sharp or similar library
 */
export function getImageDimensions(buffer: Buffer): { width: number; height: number } | null {
  // PNG signature check
  if (buffer[0] === 0x89 && buffer[1] === 0x50) {
    // PNG: width at bytes 16-19, height at 20-23
    const width = buffer.readUInt32BE(16);
    const height = buffer.readUInt32BE(20);
    return { width, height };
  }

  // JPEG signature check
  if (buffer[0] === 0xff && buffer[1] === 0xd8) {
    // JPEG: need to parse markers to find SOF
    let offset = 2;
    while (offset < buffer.length) {
      if (buffer[offset] !== 0xff) break;
      const marker = buffer[offset + 1];
      const length = buffer.readUInt16BE(offset + 2);

      // SOF0 or SOF2 markers contain dimensions
      if (marker === 0xc0 || marker === 0xc2) {
        const height = buffer.readUInt16BE(offset + 5);
        const width = buffer.readUInt16BE(offset + 7);
        return { width, height };
      }

      offset += 2 + length;
    }
  }

  return null;
}
