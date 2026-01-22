// File validation for UGC uploads

export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
];

export const ALLOWED_VIDEO_TYPES = [
  'video/mp4',
  'video/quicktime',
  'video/webm',
];

export const ALLOWED_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];
export const ALLOWED_VIDEO_EXTENSIONS = ['.mp4', '.mov', '.webm'];

export const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
export const MAX_VIDEO_SIZE_BYTES = 100 * 1024 * 1024; // 100MB

export const MAX_IMAGE_SIZE_MB = 10;
export const MAX_VIDEO_SIZE_MB = 100;

export interface ValidationResult {
  valid: boolean;
  error?: string;
  mediaType?: 'image' | 'video';
}

/**
 * Validate a file for UGC upload (client-side)
 */
export function validateFile(file: File): ValidationResult {
  const ext = '.' + file.name.split('.').pop()?.toLowerCase();
  const isImage = ALLOWED_IMAGE_EXTENSIONS.includes(ext);
  const isVideo = ALLOWED_VIDEO_EXTENSIONS.includes(ext);

  if (!isImage && !isVideo) {
    return {
      valid: false,
      error: `File type not supported. Allowed: ${[...ALLOWED_IMAGE_EXTENSIONS, ...ALLOWED_VIDEO_EXTENSIONS].join(', ')}`,
    };
  }

  const maxSize = isImage ? MAX_IMAGE_SIZE_BYTES : MAX_VIDEO_SIZE_BYTES;
  const maxSizeMB = isImage ? MAX_IMAGE_SIZE_MB : MAX_VIDEO_SIZE_MB;

  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File too large. Maximum size: ${maxSizeMB}MB`,
    };
  }

  return {
    valid: true,
    mediaType: isImage ? 'image' : 'video',
  };
}

/**
 * Validate content type (server-side)
 */
export function validateContentType(contentType: string): ValidationResult {
  const isImage = ALLOWED_IMAGE_TYPES.includes(contentType);
  const isVideo = ALLOWED_VIDEO_TYPES.includes(contentType);

  if (!isImage && !isVideo) {
    return {
      valid: false,
      error: 'Invalid content type',
    };
  }

  return {
    valid: true,
    mediaType: isImage ? 'image' : 'video',
  };
}

/**
 * Validate file size (server-side)
 */
export function validateFileSize(size: number, mediaType: 'image' | 'video'): ValidationResult {
  const maxSize = mediaType === 'image' ? MAX_IMAGE_SIZE_BYTES : MAX_VIDEO_SIZE_BYTES;

  if (size > maxSize) {
    const maxSizeMB = mediaType === 'image' ? MAX_IMAGE_SIZE_MB : MAX_VIDEO_SIZE_MB;
    return {
      valid: false,
      error: `File too large. Maximum size: ${maxSizeMB}MB`,
    };
  }

  return { valid: true };
}

/**
 * Get file extension from content type
 */
export function getExtensionFromContentType(contentType: string): string {
  const map: Record<string, string> = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
    'video/mp4': '.mp4',
    'video/quicktime': '.mov',
    'video/webm': '.webm',
  };
  return map[contentType] || '';
}
