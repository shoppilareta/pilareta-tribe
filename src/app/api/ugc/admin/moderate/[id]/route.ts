import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';

// POST /api/ugc/admin/moderate/[id] - Approve or reject a post
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.userId || !session.isAdmin) {
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

    return NextResponse.json({
      success: true,
      post: updatedPost,
      message: action === 'approve' ? 'Post approved' : 'Post rejected',
    });
  } catch (error) {
    console.error('Error moderating post:', error);
    return NextResponse.json({ error: 'Failed to moderate post' }, { status: 500 });
  }
}

// PATCH /api/ugc/admin/moderate/[id] - Update feature status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.userId || !session.isAdmin) {
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

    return NextResponse.json({
      success: true,
      post: updatedPost,
      message: isFeatured ? 'Post featured' : 'Post unfeatured',
    });
  } catch (error) {
    console.error('Error updating feature status:', error);
    return NextResponse.json({ error: 'Failed to update feature status' }, { status: 500 });
  }
}
