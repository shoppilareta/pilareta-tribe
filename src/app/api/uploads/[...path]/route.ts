import { NextRequest, NextResponse } from 'next/server';
import { readFile, stat } from 'fs/promises';
import path from 'path';
import { getUploadsBasePath } from '@/lib/uploads';
import { logger } from '@/lib/logger';

const MIME_TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.mp4': 'video/mp4',
  '.mov': 'video/quicktime',
  '.webm': 'video/webm',
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const resolvedParams = await params;
    const filePath = resolvedParams.path.join('/');

    // Prevent directory traversal attacks
    if (filePath.includes('..') || filePath.includes('\0')) {
      return NextResponse.json({ error: 'Invalid path' }, { status: 400 });
    }

    // Reject paths with suspicious characters (only allow alphanumeric, dashes, underscores, dots, slashes)
    if (!/^[a-zA-Z0-9/_.-]+$/.test(filePath)) {
      return NextResponse.json({ error: 'Invalid path' }, { status: 400 });
    }

    // Construct absolute path to the file in uploads directory
    const uploadsBase = getUploadsBasePath();
    const absolutePath = path.resolve(uploadsBase, filePath);

    // Ensure the resolved path is within the uploads directory (use resolve to canonicalize)
    if (!absolutePath.startsWith(path.resolve(uploadsBase))) {
      return NextResponse.json({ error: 'Invalid path' }, { status: 400 });
    }

    // Only serve files with known media extensions
    const ext = path.extname(absolutePath).toLowerCase();
    if (!MIME_TYPES[ext]) {
      return NextResponse.json({ error: 'File type not allowed' }, { status: 403 });
    }

    // Check if file exists and is a regular file (not directory or symlink)
    try {
      const fileStat = await stat(absolutePath);
      if (!fileStat.isFile()) {
        return NextResponse.json({ error: 'File not found' }, { status: 404 });
      }
    } catch {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // Read the file
    const fileBuffer = await readFile(absolutePath);

    // Determine content type
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    // Return the file with appropriate headers
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error) {
    logger.error('uploads', 'Failed to serve file', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
