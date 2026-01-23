import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';

// GET /api/ugc/admin/pending - Get pending posts (admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.userId || !session.isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get('cursor');
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    const posts = await prisma.ugcPost.findMany({
      where: {
        status: 'pending',
      },
      take: limit + 1,
      ...(cursor && {
        cursor: { id: cursor },
        skip: 1,
      }),
      orderBy: { createdAt: 'asc' }, // Oldest first
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
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
      },
    });

    const hasMore = posts.length > limit;
    const items = hasMore ? posts.slice(0, limit) : posts;
    const nextCursor = hasMore ? items[items.length - 1]?.id : null;

    // Get total pending count
    const totalPending = await prisma.ugcPost.count({
      where: { status: 'pending' },
    });

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
      })),
      nextCursor,
      hasMore,
      totalPending,
    });
  } catch (error) {
    console.error('Error fetching pending posts:', error);
    return NextResponse.json({ error: 'Failed to fetch pending posts' }, { status: 500 });
  }
}
