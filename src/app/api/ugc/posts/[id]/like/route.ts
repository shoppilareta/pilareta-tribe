import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';

// POST /api/ugc/posts/[id]/like - Like a post
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession(request);
    if (!session?.userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { id: postId } = await params;

    // Check post exists and is approved
    const post = await prisma.ugcPost.findUnique({
      where: { id: postId },
    });

    if (!post || post.status !== 'approved') {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Check if already liked
    const existing = await prisma.ugcLike.findUnique({
      where: {
        postId_userId: {
          postId,
          userId: session.userId,
        },
      },
    });

    if (existing) {
      return NextResponse.json({ error: 'Already liked' }, { status: 400 });
    }

    // Create like and update count
    await prisma.$transaction([
      prisma.ugcLike.create({
        data: {
          postId,
          userId: session.userId,
        },
      }),
      prisma.ugcPost.update({
        where: { id: postId },
        data: { likesCount: { increment: 1 } },
      }),
    ]);

    return NextResponse.json({ success: true, liked: true });
  } catch (error) {
    console.error('Error liking post:', error);
    return NextResponse.json({ error: 'Failed to like post' }, { status: 500 });
  }
}

// DELETE /api/ugc/posts/[id]/like - Unlike a post
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession(request);
    if (!session?.userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { id: postId } = await params;

    // Check if liked
    const existing = await prisma.ugcLike.findUnique({
      where: {
        postId_userId: {
          postId,
          userId: session.userId,
        },
      },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Not liked' }, { status: 400 });
    }

    // Delete like and update count
    await prisma.$transaction([
      prisma.ugcLike.delete({
        where: {
          postId_userId: {
            postId,
            userId: session.userId,
          },
        },
      }),
      prisma.ugcPost.update({
        where: { id: postId },
        data: { likesCount: { decrement: 1 } },
      }),
    ]);

    return NextResponse.json({ success: true, liked: false });
  } catch (error) {
    console.error('Error unliking post:', error);
    return NextResponse.json({ error: 'Failed to unlike post' }, { status: 500 });
  }
}
