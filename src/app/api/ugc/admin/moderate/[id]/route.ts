import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { logger } from '@/lib/logger';

// POST /api/ugc/admin/moderate/[id] - Approve or reject a post
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession(request);
    if (!session?.isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { action, note, feature } = body;

    if (!action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action. Must be "approve" or "reject"' }, { status: 400 });
    }

    // Check post exists
    const post = await prisma.ugcPost.findUnique({
      where: { id },
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Validate status transitions - only pending or previously moderated posts can be moderated
    if (post.deletedAt) {
      return NextResponse.json({ error: 'Cannot moderate a deleted post' }, { status: 400 });
    }

    // Warn (but allow) re-moderation of already approved/rejected posts
    const newStatus = action === 'approve' ? 'approved' : 'rejected';
    if (post.status === newStatus) {
      return NextResponse.json({ error: `Post is already ${newStatus}` }, { status: 400 });
    }

    // Validate note length if provided
    if (note && typeof note === 'string' && note.length > 2000) {
      return NextResponse.json({ error: 'Note too long (max 2000 characters)' }, { status: 400 });
    }

    // Update post
    const updatedPost = await prisma.ugcPost.update({
      where: { id },
      data: {
        status: action === 'approve' ? 'approved' : 'rejected',
        moderatedAt: new Date(),
        moderationNote: note || null,
        ...(action === 'approve' && feature && {
          isFeatured: true,
          featuredAt: new Date(),
        }),
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    logger.info('ugc/admin/moderate', `${action}d post ${id}`, { adminUserId: session.userId, postId: id });

    return NextResponse.json({
      success: true,
      post: updatedPost,
      message: action === 'approve' ? 'Post approved' : 'Post rejected',
    });
  } catch (error) {
    logger.error('ugc/admin/moderate', 'Failed to moderate post', error);
    return NextResponse.json({ error: 'Failed to moderate post' }, { status: 500 });
  }
}

// PATCH /api/ugc/admin/moderate/[id] - Update feature status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession(request);
    if (!session?.isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { isFeatured } = body;

    if (typeof isFeatured !== 'boolean') {
      return NextResponse.json({ error: 'isFeatured must be a boolean' }, { status: 400 });
    }

    // Check post exists and is approved
    const post = await prisma.ugcPost.findUnique({
      where: { id },
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    if (post.status !== 'approved') {
      return NextResponse.json({ error: 'Only approved posts can be featured' }, { status: 400 });
    }

    // Update feature status
    const updatedPost = await prisma.ugcPost.update({
      where: { id },
      data: {
        isFeatured,
        featuredAt: isFeatured ? new Date() : null,
      },
    });

    logger.info('ugc/admin/moderate', `${isFeatured ? 'featured' : 'unfeatured'} post ${id}`, { adminUserId: session.userId, postId: id });

    return NextResponse.json({
      success: true,
      post: updatedPost,
      message: isFeatured ? 'Post featured' : 'Post unfeatured',
    });
  } catch (error) {
    logger.error('ugc/admin/moderate', 'Failed to update feature status', error);
    return NextResponse.json({ error: 'Failed to update feature status' }, { status: 500 });
  }
}
