import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';

// GET /api/ugc/featured - Get featured posts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '6', 10);

    const posts = await prisma.ugcPost.findMany({
      where: {
        status: 'approved',
        isFeatured: true,
      },
      take: limit,
      orderBy: { featuredAt: 'desc' },
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
    });

    // Check if current user has liked/saved posts
    const session = await getSession();
    let userInteractions: Record<string, { liked: boolean; saved: boolean }> = {};

    if (session?.userId) {
      const postIds = posts.map((p) => p.id);

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
      posts: posts.map((post) => ({
        ...post,
        mediaUrl: transformMediaUrl(post.mediaUrl),
        thumbnailUrl: transformMediaUrl(post.thumbnailUrl),
        isLiked: userInteractions[post.id]?.liked || false,
        isSaved: userInteractions[post.id]?.saved || false,
      })),
    });
  } catch (error) {
    console.error('Error fetching featured posts:', error);
    return NextResponse.json({ error: 'Failed to fetch featured posts' }, { status: 500 });
  }
}
