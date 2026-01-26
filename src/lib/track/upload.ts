import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import {
  validateContentType,
  validateFileSize,
  getExtensionFromContentType,
  ALLOWED_IMAGE_TYPES,
} from '@/lib/ugc/validation';

const UPLOAD_BASE_PATH = process.env.NODE_ENV === 'production'
  ? '/var/www/pilareta-tribe/public/uploads/track'
  : path.join(process.cwd(), 'public/uploads/track');

const PUBLIC_URL_BASE = '/uploads/track';

export interface UploadResult {
  success: boolean;
  error?: string;
  imageUrl?: string;
  fileSizeBytes?: number;
}

/**
 * Generate file path for workout image upload
 */
function generateFilePath(logId: string, extension: string): {
  absolutePath: string;
  publicUrl: string;
} {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');

  const relativePath = `${year}/${month}`;
  const fileName = `${logId}${extension}`;

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
 * Save workout image to local storage (images only)
 */
export async function saveWorkoutImage(
  logId: string,
  fileBuffer: Buffer,
  contentType: string
): Promise<UploadResult> {
  // Only allow images for workout logs
  if (!ALLOWED_IMAGE_TYPES.includes(contentType)) {
    return {
      success: false,
      error: 'Only images are allowed (JPEG, PNG, WebP)'
    };
  }

  // Validate content type
  const typeValidation = validateContentType(contentType);
  if (!typeValidation.valid || typeValidation.mediaType !== 'image') {
    return { success: false, error: typeValidation.error || 'Only images are allowed' };
  }

  // Validate file size
  const sizeValidation = validateFileSize(fileBuffer.length, 'image');
  if (!sizeValidation.valid) {
    return { success: false, error: sizeValidation.error };
  }

  // Generate file path
  const extension = getExtensionFromContentType(contentType);
  const { absolutePath, publicUrl } = generateFilePath(logId, extension);

  try {
    // Ensure directory exists
    await ensureDirectoryExists(absolutePath);

    // Write file
    await writeFile(absolutePath, fileBuffer);

    return {
      success: true,
      imageUrl: publicUrl,
      fileSizeBytes: fileBuffer.length,
    };
  } catch (error) {
    console.error('Error saving workout image:', error);
    return {
      success: false,
      error: 'Failed to save image',
    };
  }
}

/**
 * Validate workout image file (client-side compatible)
 */
export function validateWorkoutImage(file: File): { valid: boolean; error?: string } {
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
  const ext = '.' + file.name.split('.').pop()?.toLowerCase();

  if (!allowedExtensions.includes(ext)) {
    return {
      valid: false,
      error: 'Only images are allowed (JPEG, PNG, WebP)',
    };
  }

  const maxSizeBytes = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: 'Image too large. Maximum size: 10MB',
    };
  }

  return { valid: true };
}
