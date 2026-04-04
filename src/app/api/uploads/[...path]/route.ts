import { NextRequest, NextResponse } from 'next/server';
import { open, stat } from 'fs/promises';
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
  '.m4v': 'video/mp4',
  '.mov': 'video/quicktime',
  '.webm': 'video/webm',
};

const VIDEO_EXTENSIONS = new Set(['.mp4', '.m4v', '.mov', '.webm']);

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
    let fileSize: number;
    try {
      const fileStat = await stat(absolutePath);
      if (!fileStat.isFile()) {
        return NextResponse.json({ error: 'File not found' }, { status: 404 });
      }
      fileSize = fileStat.size;
    } catch {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    const isVideo = VIDEO_EXTENSIONS.has(ext);

    // Handle Range requests for video streaming (seeking, progressive playback)
    const rangeHeader = request.headers.get('range');
    if (isVideo && rangeHeader) {
      const match = rangeHeader.match(/bytes=(\d+)-(\d*)/);
      if (match) {
        const start = parseInt(match[1], 10);
        const end = match[2] ? parseInt(match[2], 10) : fileSize - 1;

        if (start >= fileSize || end >= fileSize || start > end) {
          return new NextResponse(null, {
            status: 416,
            headers: { 'Content-Range': `bytes */${fileSize}` },
          });
        }

        const chunkSize = end - start + 1;
        const fileHandle = await open(absolutePath, 'r');
        const buffer = Buffer.alloc(chunkSize);
        await fileHandle.read(buffer, 0, chunkSize, start);
        await fileHandle.close();

        return new NextResponse(buffer, {
          status: 206,
          headers: {
            'Content-Type': contentType,
            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
            'Content-Length': String(chunkSize),
            'Accept-Ranges': 'bytes',
            'Cache-Control': 'public, max-age=86400',
            'X-Content-Type-Options': 'nosniff',
          },
        });
      }
    }

    // Full file response
    const fileHandle = await open(absolutePath, 'r');
    const fileBuffer = Buffer.alloc(fileSize);
    await fileHandle.read(fileBuffer, 0, fileSize, 0);
    await fileHandle.close();

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': String(fileSize),
        ...(isVideo ? { 'Accept-Ranges': 'bytes' } : {}),
        'Cache-Control': isVideo
          ? 'public, max-age=86400'  // 1 day for videos (can be re-uploaded)
          : 'public, max-age=31536000, immutable',  // 1 year for images
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error) {
    logger.error('uploads', 'Failed to serve file', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
