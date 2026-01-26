import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { checkUploadRateLimit, saveUploadedFile } from '@/lib/ugc/upload';

// GET /api/ugc/posts - Get feed (public)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get('cursor');
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const tag = searchParams.get('tag');
    const studioId = searchParams.get('studioId');

    const where: Record<string, unknown> = {
      status: 'approved',
    };

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
    const session = await getSession();
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
    console.error('Error fetching posts:', error);
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

// Helper to fetch Instagram thumbnail via oEmbed API with fallback to og:image
async function fetchInstagramThumbnail(url: string): Promise<string | null> {
  // Clean the URL - remove tracking parameters
  const cleanUrl = url.split('?')[0];

  // Try oEmbed first
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
    // oEmbed failed, try fallback
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

// POST /api/ugc/posts - Create post (auth required)
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Check rate limit (admins are exempt)
    const rateLimit = await checkUploadRateLimit(session.userId, session.isAdmin || false);
    if (!rateLimit.allowed) {
      return NextResponse.json({ error: rateLimit.error }, { status: 429 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const instagramUrl = formData.get('instagramUrl') as string | null;
    const caption = formData.get('caption') as string | null;
    const studioId = formData.get('studioId') as string | null;
    const tagIds = formData.get('tagIds') as string | null;
    const consentGiven = formData.get('consentGiven') === 'true';

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

    // Handle Instagram URL
    if (instagramUrl) {
      if (!isValidInstagramUrl(instagramUrl)) {
        return NextResponse.json(
          { error: 'Invalid Instagram URL. Please use a link to an Instagram post or reel.' },
          { status: 400 }
        );
      }

      const instagramPostId = extractInstagramPostId(instagramUrl);

      // Try to fetch Instagram thumbnail
      const thumbnailUrl = await fetchInstagramThumbnail(instagramUrl);

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
        },
      });

      // Add tags if provided
      if (tagIds) {
        const tagIdArray = JSON.parse(tagIds) as string[];
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
      const tagIdArray = JSON.parse(tagIds) as string[];
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
    console.error('Error creating post:', error);
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }
}
