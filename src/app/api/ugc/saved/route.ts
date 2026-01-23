import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';

// GET /api/ugc/saved - Get current user's saved posts
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get('cursor');
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    const saves = await prisma.ugcSave.findMany({
      where: {
        userId: session.userId,
        post: {
          status: 'approved',
        },
      },
      take: limit + 1,
      ...(cursor && {
        cursor: { id: cursor },
        skip: 1,
      }),
      orderBy: { createdAt: 'desc' },
      include: {
        post: {
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
            _count: {
              select: {
                likes: true,
                comments: true,
                saves: true,
              },
            },
          },
        },
      },
    });

    const hasMore = saves.length > limit;
    const items = hasMore ? saves.slice(0, limit) : saves;
    const nextCursor = hasMore ? items[items.length - 1]?.id : null;

    // Check which posts are liked by user
    const postIds = items.map((s) => s.post.id);
    const likes = await prisma.ugcLike.findMany({
      where: {
        userId: session.userId,
        postId: { in: postIds },
      },
      select: { postId: true },
    });
    const likedIds = new Set(likes.map((l) => l.postId));

    // Helper to transform /uploads/... paths to /api/uploads/...
    const transformMediaUrl = (url: string | null): string | null => {
      if (!url) return null;
      if (url.startsWith('/uploads/')) {
        return '/api' + url;
      }
      return url;
    };

    return NextResponse.json({
      posts: items.map((save) => ({
        ...save.post,
        mediaUrl: transformMediaUrl(save.post.mediaUrl),
        thumbnailUrl: transformMediaUrl(save.post.thumbnailUrl),
        isLiked: likedIds.has(save.post.id),
        isSaved: true,
        savedAt: save.createdAt,
      })),
      nextCursor,
      hasMore,
    });
  } catch (error) {
    console.error('Error fetching saved posts:', error);
    return NextResponse.json({ error: 'Failed to fetch saved posts' }, { status: 500 });
  }
}
