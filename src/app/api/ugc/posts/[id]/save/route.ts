import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';

// POST /api/ugc/posts/[id]/save - Save a post
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

    // Check if already saved
    const existing = await prisma.ugcSave.findUnique({
      where: {
        postId_userId: {
          postId,
          userId: session.userId,
        },
      },
    });

    if (existing) {
      return NextResponse.json({ error: 'Already saved' }, { status: 400 });
    }

    // Create save and update count
    await prisma.$transaction([
      prisma.ugcSave.create({
        data: {
          postId,
          userId: session.userId,
        },
      }),
      prisma.ugcPost.update({
        where: { id: postId },
        data: { savesCount: { increment: 1 } },
      }),
    ]);

    return NextResponse.json({ success: true, saved: true });
  } catch (error) {
    console.error('Error saving post:', error);
    return NextResponse.json({ error: 'Failed to save post' }, { status: 500 });
  }
}

// DELETE /api/ugc/posts/[id]/save - Unsave a post
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

    // Check if saved
    const existing = await prisma.ugcSave.findUnique({
      where: {
        postId_userId: {
          postId,
          userId: session.userId,
        },
      },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Not saved' }, { status: 400 });
    }

    // Delete save and update count
    await prisma.$transaction([
      prisma.ugcSave.delete({
        where: {
          postId_userId: {
            postId,
            userId: session.userId,
          },
        },
      }),
      prisma.ugcPost.update({
        where: { id: postId },
        data: { savesCount: { decrement: 1 } },
      }),
    ]);

    return NextResponse.json({ success: true, saved: false });
  } catch (error) {
    console.error('Error unsaving post:', error);
    return NextResponse.json({ error: 'Failed to unsave post' }, { status: 500 });
  }
}
