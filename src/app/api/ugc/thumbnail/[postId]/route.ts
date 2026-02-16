import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { readFile, writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { getUploadsBasePath, getUgcUploadsPath } from '@/lib/uploads';

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

async function fetchInstagramThumbnailUrl(url: string): Promise<string | null> {
  const cleanUrl = url.split('?')[0];

  try {
    const oembedUrl = `https://api.instagram.com/oembed?url=${encodeURIComponent(cleanUrl)}`;
    const response = await fetch(oembedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Accept': 'application/json',
      },
    });
    if (response.ok) {
      const data = await response.json();
      if (data.thumbnail_url) {
        return decodeHtmlEntities(data.thumbnail_url);
      }
    }
  } catch {
    // oEmbed failed
  }

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
        'Accept': 'text/html',
      },
    });
    if (response.ok) {
      const html = await response.text();
      const ogImageMatch = html.match(/<meta[^>]*property="og:image"[^>]*content="([^"]+)"/i)
        || html.match(/<meta[^>]*content="([^"]+)"[^>]*property="og:image"/i);
      if (ogImageMatch && ogImageMatch[1]) {
        return decodeHtmlEntities(ogImageMatch[1]);
      }
    }
  } catch {
    // Fallback also failed
  }

  return null;
}

async function downloadAndSave(postId: string, imageUrl: string): Promise<string | null> {
  try {
    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      },
    });
    if (!response.ok) return null;

    const buffer = Buffer.from(await response.arrayBuffer());
    if (buffer.length === 0) return null;

    const contentType = response.headers.get('content-type') || 'image/jpeg';
    let ext = '.jpg';
    if (contentType.includes('png')) ext = '.png';
    else if (contentType.includes('webp')) ext = '.webp';

    const basePath = getUgcUploadsPath();

    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const dirPath = path.join(basePath, 'thumbnails', `${year}`, `${month}`);
    const fileName = `${postId}-thumb${ext}`;
    const filePath = path.join(dirPath, fileName);
    const publicUrl = `/uploads/ugc/thumbnails/${year}/${month}/${fileName}`;

    if (!existsSync(dirPath)) {
      await mkdir(dirPath, { recursive: true });
    }

    await writeFile(filePath, buffer);
    return publicUrl;
  } catch {
    return null;
  }
}

// GET /api/ugc/thumbnail/[postId]
// Dynamically serves Instagram post thumbnails.
// If a local thumbnail exists, serves it directly.
// Otherwise fetches from Instagram, saves locally, and serves.
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  const { postId } = await params;

  const post = await prisma.ugcPost.findUnique({
    where: { id: postId },
    select: { id: true, thumbnailUrl: true, instagramUrl: true },
  });

  if (!post) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 });
  }

  const uploadsBase = getUploadsBasePath();

  // Case 1: Post has a local thumbnail that exists on disk
  if (post.thumbnailUrl && post.thumbnailUrl.startsWith('/uploads/')) {
    // Strip /uploads/ prefix since uploadsBase already points to the uploads root
    const relativePath = post.thumbnailUrl.replace(/^\/uploads\//, '');
    const filePath = path.join(uploadsBase, relativePath);
    if (existsSync(filePath)) {
      try {
        const buffer = await readFile(filePath);
        const ext = path.extname(filePath).toLowerCase();
        const contentType = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg';
        return new NextResponse(buffer, {
          headers: {
            'Content-Type': contentType,
            'Cache-Control': 'public, max-age=86400, s-maxage=86400',
          },
        });
      } catch {
        // File read failed, try to re-fetch below
      }
    }
  }

  // Case 2: No local thumbnail — try to fetch from Instagram
  if (!post.instagramUrl) {
    return NextResponse.json({ error: 'No thumbnail available' }, { status: 404 });
  }

  const thumbnailCdnUrl = await fetchInstagramThumbnailUrl(post.instagramUrl);
  if (!thumbnailCdnUrl) {
    return NextResponse.json({ error: 'Could not fetch Instagram thumbnail' }, { status: 502 });
  }

  // Try to download and save locally
  const localUrl = await downloadAndSave(post.id, thumbnailCdnUrl);

  if (localUrl) {
    // Update DB with local URL
    await prisma.ugcPost.update({
      where: { id: post.id },
      data: { thumbnailUrl: localUrl },
    });

    const filePath = path.join(uploadsBase, localUrl.replace(/^\/uploads\//, ''));
    try {
      const buffer = await readFile(filePath);
      const ext = path.extname(filePath).toLowerCase();
      const contentType = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg';
      return new NextResponse(buffer, {
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=86400, s-maxage=86400',
        },
      });
    } catch {
      // Fall through to proxy
    }
  }

  // Fallback: proxy the CDN URL directly
  try {
    const response = await fetch(thumbnailCdnUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      },
    });
    if (response.ok) {
      const buffer = Buffer.from(await response.arrayBuffer());
      const contentType = response.headers.get('content-type') || 'image/jpeg';
      return new NextResponse(buffer, {
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=3600',
        },
      });
    }
  } catch {
    // Proxy also failed
  }

  return NextResponse.json({ error: 'Thumbnail unavailable' }, { status: 502 });
}
