import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { logAdminAction } from '@/lib/admin/audit';

// GET /api/admin/comments — Paginated list of all comments, newest first
export async function GET(request: NextRequest) {
  try {
    const session = await getSession(request);
    if (!session?.userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    const user = await prisma.user.findUnique({ where: { id: session.userId } });
    if (!user?.isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50')));
    const skip = (page - 1) * limit;

    const where = { deletedAt: null };

    const [comments, total] = await Promise.all([
      prisma.ugcComment.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          user: { select: { id: true, email: true, firstName: true } },
          post: { select: { id: true, caption: true } },
        },
      }),
      prisma.ugcComment.count({ where }),
    ]);

    return NextResponse.json({
      comments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error('admin/comments', 'Failed to fetch comments', error);
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
  }
}

// DELETE /api/admin/comments — Soft-delete a comment
export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession(request);
    if (!session?.userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    const user = await prisma.user.findUnique({ where: { id: session.userId } });
    if (!user?.isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { commentId } = await request.json();

    if (!commentId || typeof commentId !== 'string') {
      return NextResponse.json({ error: 'commentId is required' }, { status: 400 });
    }

    const comment = await prisma.ugcComment.findUnique({ where: { id: commentId } });
    if (!comment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }
    if (comment.deletedAt) {
      return NextResponse.json({ error: 'Comment already deleted' }, { status: 400 });
    }

    await prisma.ugcComment.update({
      where: { id: commentId },
      data: { deletedAt: new Date() },
    });

    // Decrement the parent post's comment count
    await prisma.ugcPost.update({
      where: { id: comment.postId },
      data: { commentsCount: { decrement: 1 } },
    });

    await logAdminAction(session.userId, 'delete', 'comment', commentId, {
      postId: comment.postId,
      content: comment.content.substring(0, 100),
    });

    logger.info('admin/comments', `Deleted comment ${commentId}`, { adminUserId: session.userId });

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('admin/comments', 'Failed to delete comment', error);
    return NextResponse.json({ error: 'Failed to delete comment' }, { status: 500 });
  }
}
