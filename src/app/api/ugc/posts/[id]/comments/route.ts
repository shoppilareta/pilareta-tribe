import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { moderateContent } from '@/lib/moderation';
import { validateCsrf } from '@/lib/csrf';
import { logger } from '@/lib/logger';
import { notifyComment } from '@/lib/social-notifications';

// GET /api/ugc/posts/[id]/comments - Get comments
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params;
    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get('cursor');
    const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '20', 10), 1), 100);

    // Check post exists and is approved
    const post = await prisma.ugcPost.findUnique({
      where: { id: postId },
    });

    if (!post || post.status !== 'approved' || post.deletedAt) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const comments = await prisma.ugcComment.findMany({
      where: {
        postId,
        isHidden: false,
        deletedAt: null,
      },
      take: limit + 1,
      ...(cursor && {
        cursor: { id: cursor },
        skip: 1,
      }),
      orderBy: { createdAt: 'asc' },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    const hasMore = comments.length > limit;
    const items = hasMore ? comments.slice(0, limit) : comments;
    const nextCursor = hasMore ? items[items.length - 1]?.id : null;

    return NextResponse.json({
      comments: items,
      nextCursor,
      hasMore,
    });
  } catch (error) {
    logger.error('ugc/posts/[id]/comments', 'Failed to fetch comments', error);
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
  }
}

// POST /api/ugc/posts/[id]/comments - Add comment
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!validateCsrf(request)) {
      return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 });
    }

    const session = await getSession(request);
    if (!session?.userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { id: postId } = await params;
    const body = await request.json();
    const { content } = body;

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json({ error: 'Comment content is required' }, { status: 400 });
    }

    if (content.length > 1000) {
      return NextResponse.json({ error: 'Comment is too long (max 1000 characters)' }, { status: 400 });
    }

    // Check for profanity
    const moderation = moderateContent(content);
    if (!moderation.clean) {
      return NextResponse.json({ error: 'Comment contains inappropriate content' }, { status: 400 });
    }

    // Check post exists and is approved
    const post = await prisma.ugcPost.findUnique({
      where: { id: postId },
    });

    if (!post || post.status !== 'approved' || post.deletedAt) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Create comment and update count
    const [comment] = await prisma.$transaction([
      prisma.ugcComment.create({
        data: {
          postId,
          userId: session.userId,
          content: content.trim(),
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      }),
      prisma.ugcPost.update({
        where: { id: postId },
        data: { commentsCount: { increment: 1 } },
      }),
    ]);

    // Fire-and-forget: notify post owner
    notifyComment(post.userId, session.userId, postId, content.trim());

    return NextResponse.json({ success: true, comment });
  } catch (error) {
    logger.error('ugc/posts/[id]/comments', 'Failed to create comment', error);
    return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 });
  }
}
