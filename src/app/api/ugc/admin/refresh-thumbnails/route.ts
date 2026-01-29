import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

// Helper to decode HTML entities in URLs
function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

// Fetch Instagram thumbnail URL via oEmbed
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

  // Fallback: fetch page and extract og:image
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
        'Accept': 'text/html',
      },
    });

    if (response.ok) {
      const html = await response.text();
      const ogImageMatch = html.match(/<meta[^>]*property="og:image"[^>]*content="([^"]+)"/i);
      if (ogImageMatch && ogImageMatch[1]) {
        return decodeHtmlEntities(ogImageMatch[1]);
      }
      const ogImageMatch2 = html.match(/<meta[^>]*content="([^"]+)"[^>]*property="og:image"/i);
      if (ogImageMatch2 && ogImageMatch2[1]) {
        return decodeHtmlEntities(ogImageMatch2[1]);
      }
    }
  } catch {
    // Fallback also failed
  }

  return null;
}

// Download image and save locally
async function downloadAndSaveImage(postId: string, imageUrl: string): Promise<string | null> {
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

    const basePath = process.env.NODE_ENV === 'production'
      ? '/var/www/pilareta-tribe/public/uploads/ugc'
      : path.join(process.cwd(), 'public/uploads/ugc');

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
  } catch (error) {
    console.error(`Error downloading thumbnail for post ${postId}:`, error);
    return null;
  }
}

// POST /api/ugc/admin/refresh-thumbnails - Re-fetch Instagram thumbnails for all posts
export async function POST() {
  try {
    const session = await getSession();
    if (!session?.isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Find all Instagram posts with external thumbnailUrl (CDN URLs)
    const instagramPosts = await prisma.ugcPost.findMany({
      where: {
        mediaType: 'instagram',
        instagramUrl: { not: null },
      },
      select: {
        id: true,
        instagramUrl: true,
        thumbnailUrl: true,
      },
    });

    const results = {
      total: instagramPosts.length,
      updated: 0,
      failed: 0,
      skipped: 0,
      details: [] as { id: string; status: string; url?: string }[],
    };

    for (const post of instagramPosts) {
      // Skip posts that already have local thumbnails
      if (post.thumbnailUrl && post.thumbnailUrl.startsWith('/uploads/')) {
        results.skipped++;
        results.details.push({ id: post.id, status: 'skipped (already local)' });
        continue;
      }

      if (!post.instagramUrl) {
        results.skipped++;
        results.details.push({ id: post.id, status: 'skipped (no instagram URL)' });
        continue;
      }

      // Try to get a fresh thumbnail URL
      const thumbnailUrl = await fetchInstagramThumbnailUrl(post.instagramUrl);

      if (!thumbnailUrl) {
        results.failed++;
        results.details.push({ id: post.id, status: 'failed (could not fetch thumbnail URL)' });
        continue;
      }

      // Download and save locally
      const localUrl = await downloadAndSaveImage(post.id, thumbnailUrl);

      if (localUrl) {
        await prisma.ugcPost.update({
          where: { id: post.id },
          data: { thumbnailUrl: localUrl },
        });
        results.updated++;
        results.details.push({ id: post.id, status: 'updated', url: localUrl });
      } else {
        results.failed++;
        results.details.push({ id: post.id, status: 'failed (could not download image)' });
      }

      // Small delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    return NextResponse.json({
      success: true,
      results,
    });
  } catch (error) {
    console.error('Error refreshing thumbnails:', error);
    return NextResponse.json({ error: 'Failed to refresh thumbnails' }, { status: 500 });
  }
}
