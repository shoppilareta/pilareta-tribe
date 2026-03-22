import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { checkUploadRateLimit, saveUploadedFile } from '@/lib/ugc/upload';
import { getUgcUploadsPath } from '@/lib/uploads';
import { rateLimit } from '@/lib/rate-limit';
import { moderateContent } from '@/lib/moderation';
import { checkUserStorageLimit } from '@/lib/upload-limits';
import { validateCsrf } from '@/lib/csrf';
import { logger } from '@/lib/logger';

// Helper to get display name from user data
function getDisplayName(user: { firstName: string | null; lastName: string | null; email: string }): string {
  if (user.firstName && user.lastName) {
    return `${user.firstName} ${user.lastName}`;
  }
  if (user.firstName) {
    return user.firstName;
  }
  // Fallback to email prefix (capitalize first letter)
  const emailPrefix = user.email.split('@')[0];
  return emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1);
}

// GET /api/ugc/posts - Get feed (public)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get('cursor');
    const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '20', 10), 1), 100);
    const tag = searchParams.get('tag');
    const studioId = searchParams.get('studioId');
    const feed = searchParams.get('feed'); // "following" to filter to followed users

    const where: Record<string, unknown> = {
      status: 'approved',
      deletedAt: null,
    };

    // If feed=following, filter to posts from users the current user follows
    if (feed === 'following') {
      const session = await getSession(request);
      if (!session?.userId) {
        return NextResponse.json({ error: 'Authentication required for following feed' }, { status: 401 });
      }

      const followedUsers = await prisma.userFollow.findMany({
        where: { followerId: session.userId },
        select: { followingId: true },
      });

      const followedUserIds = followedUsers.map((f) => f.followingId);

      if (followedUserIds.length === 0) {
        return NextResponse.json({
          posts: [],
          nextCursor: null,
          hasMore: false,
        });
      }

      where.userId = { in: followedUserIds };
    }

    if (tag) {
      where.tags = {
        some: {
          tag: {
            slug: tag,
          },
        },
      };
    }

    if (studioId) {
      where.studioId = studioId;
    }

    const posts = await prisma.ugcPost.findMany({
      where,
      take: limit + 1,
      ...(cursor && {
        cursor: { id: cursor },
        skip: 1,
      }),
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            isAdmin: true,
          },
        },
        studio: {
          select: {
            id: true,
            name: true,
            city: true,
          },
        },
        tags: {
          include: {
            tag: true,
          },
        },
        workoutRecap: {
          select: {
            id: true,
            workoutDate: true,
            durationMinutes: true,
            workoutType: true,
            rpe: true,
            calorieEstimate: true,
            focusAreas: true,
            imageUrl: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
            saves: true,
          },
        },
      },
    });

    const hasMore = posts.length > limit;
    const items = hasMore ? posts.slice(0, limit) : posts;
    const nextCursor = hasMore ? items[items.length - 1]?.id : null;

    // Check if current user has liked/saved posts
    const session = await getSession(request);
    let userInteractions: Record<string, { liked: boolean; saved: boolean }> = {};

    if (session?.userId) {
      const postIds = items.map((p) => p.id);

      const [likes, saves] = await Promise.all([
        prisma.ugcLike.findMany({
          where: {
            userId: session.userId,
            postId: { in: postIds },
          },
          select: { postId: true },
        }),
        prisma.ugcSave.findMany({
          where: {
            userId: session.userId,
            postId: { in: postIds },
          },
          select: { postId: true },
        }),
      ]);

      const likedIds = new Set(likes.map((l) => l.postId));
      const savedIds = new Set(saves.map((s) => s.postId));

      userInteractions = Object.fromEntries(
        postIds.map((id) => [
          id,
          {
            liked: likedIds.has(id),
            saved: savedIds.has(id),
          },
        ])
      );
    }

    // Helper to transform /uploads/... paths to /api/uploads/...
    const transformMediaUrl = (url: string | null): string | null => {
      if (!url) return null;
      if (url.startsWith('/uploads/')) {
        return '/api' + url;
      }
      return url;
    };

    return NextResponse.json({
      posts: items.map((post) => ({
        ...post,
        mediaUrl: transformMediaUrl(post.mediaUrl),
        thumbnailUrl: transformMediaUrl(post.thumbnailUrl),
        isLiked: userInteractions[post.id]?.liked || false,
        isSaved: userInteractions[post.id]?.saved || false,
        // Add displayName for the user
        user: {
          ...post.user,
          displayName: getDisplayName(post.user),
        },
        // Transform workout recap image URL if present
        workoutRecap: post.workoutRecap ? {
          ...post.workoutRecap,
          imageUrl: transformMediaUrl(post.workoutRecap.imageUrl),
        } : null,
      })),
      nextCursor,
      hasMore,
    });
  } catch (error) {
    logger.error('ugc/posts', 'Failed to fetch posts', error);
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }
}

// Helper to extract Instagram post ID from URL
function extractInstagramPostId(url: string): string | null {
  // Patterns:
  // https://www.instagram.com/p/ABC123/
  // https://instagram.com/p/ABC123/
  // https://www.instagram.com/reel/ABC123/
  const patterns = [
    /instagram\.com\/p\/([A-Za-z0-9_-]+)/,
    /instagram\.com\/reel\/([A-Za-z0-9_-]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }
  return null;
}

// Helper to validate Instagram URL
function isValidInstagramUrl(url: string): boolean {
  return extractInstagramPostId(url) !== null;
}

// Helper to decode HTML entities in URLs
function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

// Validate that a URL hostname belongs to Instagram/CDN Instagram
function isAllowedInstagramHost(urlString: string): boolean {
  try {
    const parsed = new URL(urlString);
    const hostname = parsed.hostname.toLowerCase();
    return (
      hostname === 'instagram.com' ||
      hostname.endsWith('.instagram.com') ||
      hostname === 'cdninstagram.com' ||
      hostname.endsWith('.cdninstagram.com')
    );
  } catch {
    return false;
  }
}

// Helper to fetch Instagram thumbnail URL via oEmbed API with fallback to og:image
async function fetchInstagramThumbnailUrl(url: string): Promise<string | null> {
  // Validate hostname before making any requests (SSRF protection)
  if (!isAllowedInstagramHost(url)) {
    return null;
  }

  // Clean the URL - remove tracking parameters
  const cleanUrl = url.split('?')[0];

  // Try oEmbed first
  try {
    const oembedUrl = `https://api.instagram.com/oembed?url=${encodeURIComponent(cleanUrl)}`;
    const oembedController = new AbortController();
    const oembedTimeout = setTimeout(() => oembedController.abort(), 5000);
    const response = await fetch(oembedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Accept': 'application/json',
      },
      signal: oembedController.signal,
    });
    clearTimeout(oembedTimeout);

    if (response.ok) {
      const data = await response.json();
      if (data.thumbnail_url) {
        return decodeHtmlEntities(data.thumbnail_url);
      }
    }
  } catch {
    // oEmbed failed, try fallback
  }

  // Fallback: fetch page and extract og:image
  try {
    const fallbackController = new AbortController();
    const fallbackTimeout = setTimeout(() => fallbackController.abort(), 5000);
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
        'Accept': 'text/html',
      },
      signal: fallbackController.signal,
    });
    clearTimeout(fallbackTimeout);

    if (response.ok) {
      const html = await response.text();

      // Look for og:image meta tag
      const ogImageMatch = html.match(/<meta[^>]*property="og:image"[^>]*content="([^"]+)"/i);
      if (ogImageMatch && ogImageMatch[1]) {
        return decodeHtmlEntities(ogImageMatch[1]);
      }

      // Try alternate pattern
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

// Download Instagram thumbnail and save locally.
// Returns local path on success, or the CDN URL as fallback if local save fails.
async function fetchAndSaveInstagramThumbnail(postId: string, instagramUrl: string): Promise<string | null> {
  const thumbnailUrl = await fetchInstagramThumbnailUrl(instagramUrl);
  if (!thumbnailUrl) return null;

  try {
    // Validate thumbnail URL hostname (SSRF protection)
    if (!isAllowedInstagramHost(thumbnailUrl)) {
      return null;
    }

    // Download the image with timeout
    const downloadController = new AbortController();
    const downloadTimeout = setTimeout(() => downloadController.abort(), 5000);
    const response = await fetch(thumbnailUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      },
      signal: downloadController.signal,
    });
    clearTimeout(downloadTimeout);

    if (!response.ok) return thumbnailUrl; // Return CDN URL as fallback

    // Check Content-Length — reject if > 5MB
    const contentLength = response.headers.get('content-length');
    if (contentLength && parseInt(contentLength, 10) > 5 * 1024 * 1024) {
      return null;
    }

    // Check Content-Type — only allow image/* types
    const responseContentType = response.headers.get('content-type') || '';
    if (!responseContentType.startsWith('image/')) {
      return null;
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    if (buffer.length === 0) return thumbnailUrl;

    // Double-check actual size after download
    if (buffer.length > 5 * 1024 * 1024) {
      return null;
    }

    // Determine file extension from content type
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    let ext = '.jpg';
    if (contentType.includes('png')) ext = '.png';
    else if (contentType.includes('webp')) ext = '.webp';

    // Save to local uploads directory
    const { writeFile, mkdir } = await import('fs/promises');
    const { existsSync } = await import('fs');
    const path = await import('path');

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
  } catch (error) {
    logger.error('ugc/posts', 'Failed to download Instagram thumbnail', error);
    return thumbnailUrl; // Return CDN URL as fallback
  }
}

// POST /api/ugc/posts - Create post (auth required)
export async function POST(request: NextRequest) {
  try {
    if (!validateCsrf(request)) {
      return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 });
    }

    const session = await getSession(request);
    if (!session?.userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const limiter = await rateLimit(request, { limit: 5, window: 60, userId: session.userId });
    if (!limiter.success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    // Check upload rate limit (admins are exempt)
    const uploadLimit = await checkUploadRateLimit(session.userId, session.isAdmin || false);
    if (!uploadLimit.allowed) {
      return NextResponse.json({ error: uploadLimit.error }, { status: 429 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const instagramUrl = formData.get('instagramUrl') as string | null;
    const caption = formData.get('caption') as string | null;
    const studioId = formData.get('studioId') as string | null;
    const tagIds = formData.get('tagIds') as string | null;
    const consentGiven = formData.get('consentGiven') === 'true';

    if (caption && caption.length > 2000) {
      return NextResponse.json({ error: 'Caption too long (max 2000 characters)' }, { status: 400 });
    }

    // Must have either file or Instagram URL
    if (!file && !instagramUrl) {
      return NextResponse.json({ error: 'File or Instagram URL is required' }, { status: 400 });
    }

    if (!consentGiven) {
      return NextResponse.json(
        { error: 'You must agree to the community guidelines' },
        { status: 400 }
      );
    }

    // Moderate caption content
    const captionModeration = caption ? moderateContent(caption) : { clean: true, flaggedWords: [] as string[] };
    const moderationNote = !captionModeration.clean
      ? `Auto-flagged: caption contains potentially inappropriate language (${captionModeration.flaggedWords.join(', ')})`
      : null;

    // Handle Instagram URL
    if (instagramUrl) {
      if (!isValidInstagramUrl(instagramUrl)) {
        return NextResponse.json(
          { error: 'Invalid Instagram URL. Please use a link to an Instagram post or reel.' },
          { status: 400 }
        );
      }

      const instagramPostId = extractInstagramPostId(instagramUrl);

      // Generate a temp post ID for the thumbnail filename
      const tempId = `ig-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

      // Try to fetch and save Instagram thumbnail locally
      const thumbnailUrl = await fetchAndSaveInstagramThumbnail(tempId, instagramUrl);

      const post = await prisma.ugcPost.create({
        data: {
          userId: session.userId,
          caption: caption || null,
          studioId: studioId || null,
          mediaUrl: null,
          mediaType: 'instagram',
          thumbnailUrl: thumbnailUrl,
          instagramUrl: instagramUrl,
          instagramPostId: instagramPostId,
          consentGiven: true,
          consentTimestamp: new Date(),
          status: 'pending',
          moderationNote,
        },
      });

      // Add tags if provided
      if (tagIds) {
        let tagIdArray: string[];
        try {
          tagIdArray = JSON.parse(tagIds) as string[];
        } catch {
          return NextResponse.json({ error: 'Invalid JSON in tagIds' }, { status: 400 });
        }
        if (tagIdArray.length > 0) {
          await prisma.ugcPostTag.createMany({
            data: tagIdArray.map((tagId) => ({
              postId: post.id,
              tagId,
            })),
          });
        }
      }

      return NextResponse.json({
        success: true,
        post,
        message: 'Your Instagram post has been submitted for review',
      });
    }

    // Handle file upload
    if (!file) {
      return NextResponse.json({ error: 'File is required' }, { status: 400 });
    }

    // Check per-user storage cap before saving file
    const storageCheck = await checkUserStorageLimit(session.userId);
    if (!storageCheck.allowed) {
      return NextResponse.json(
        { error: 'Storage limit reached (500MB)' },
        { status: 413 }
      );
    }

    // Create post first to get ID
    const post = await prisma.ugcPost.create({
      data: {
        userId: session.userId,
        caption: caption || null,
        studioId: studioId || null,
        mediaUrl: '', // Will update after file save
        mediaType: 'image', // Will update after file save
        consentGiven: true,
        consentTimestamp: new Date(),
        status: 'pending',
        moderationNote,
      },
    });

    // Save file
    const buffer = Buffer.from(await file.arrayBuffer());
    const uploadResult = await saveUploadedFile(post.id, buffer, file.type);

    if (!uploadResult.success) {
      // Delete the post if file save failed
      await prisma.ugcPost.delete({ where: { id: post.id } });
      return NextResponse.json({ error: uploadResult.error }, { status: 400 });
    }

    // Update post with file info
    const updatedPost = await prisma.ugcPost.update({
      where: { id: post.id },
      data: {
        mediaUrl: uploadResult.mediaUrl!,
        mediaType: uploadResult.mediaType!,
        fileSizeBytes: uploadResult.fileSizeBytes,
      },
    });

    // Add tags if provided
    if (tagIds) {
      let tagIdArray: string[];
      try {
        tagIdArray = JSON.parse(tagIds) as string[];
      } catch {
        return NextResponse.json({ error: 'Invalid JSON in tagIds' }, { status: 400 });
      }
      if (tagIdArray.length > 0) {
        await prisma.ugcPostTag.createMany({
          data: tagIdArray.map((tagId) => ({
            postId: post.id,
            tagId,
          })),
        });
      }
    }

    return NextResponse.json({
      success: true,
      post: updatedPost,
      message: 'Your post has been submitted for review',
    });
  } catch (error) {
    logger.error('ugc/posts', 'Failed to create post', error);
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }
}
