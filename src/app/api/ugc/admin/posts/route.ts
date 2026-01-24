import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';

// GET /api/ugc/admin/posts - Get all posts with filters (admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.userId || !session.isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get('cursor');
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const status = searchParams.get('status'); // 'approved', 'pending', 'rejected', or null for all
    const featured = searchParams.get('featured'); // 'true', 'false', or null for all

    // Build where clause
    const where: Record<string, unknown> = {};
    if (status && ['approved', 'pending', 'rejected'].includes(status)) {
      where.status = status;
    }
    if (featured === 'true') {
      where.isFeatured = true;
    } else if (featured === 'false') {
      where.isFeatured = false;
    }

    const posts = await prisma.ugcPost.findMany({
      where,
      take: limit + 1,
      ...(cursor && {
        cursor: { id: cursor },
        skip: 1,
      }),
      orderBy: { createdAt: 'desc' }, // Newest first
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
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    });

    const hasMore = posts.length > limit;
    const items = hasMore ? posts.slice(0, limit) : posts;
    const nextCursor = hasMore ? items[items.length - 1]?.id : null;

    // Get counts for each status
    const [totalAll, totalApproved, totalPending, totalRejected, totalFeatured] = await Promise.all([
      prisma.ugcPost.count(),
      prisma.ugcPost.count({ where: { status: 'approved' } }),
      prisma.ugcPost.count({ where: { status: 'pending' } }),
      prisma.ugcPost.count({ where: { status: 'rejected' } }),
      prisma.ugcPost.count({ where: { isFeatured: true } }),
    ]);

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
      counts: {
        all: totalAll,
        approved: totalApproved,
        pending: totalPending,
        rejected: totalRejected,
        featured: totalFeatured,
      },
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }
}
