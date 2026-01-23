import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { unlink } from 'fs/promises';
import path from 'path';

// GET /api/ugc/posts/[id] - Get single post
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const post = await prisma.ugcPost.findUnique({
      where: { id },
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
        comments: {
          where: { isHidden: false },
          orderBy: { createdAt: 'desc' },
          take: 20,
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
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

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Only show approved posts publicly, or if user is admin or owner
    const session = await getSession();
    const isOwner = session?.userId === post.userId;
    const isAdmin = session?.isAdmin;

    if (post.status !== 'approved' && !isOwner && !isAdmin) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Check user interactions
    let isLiked = false;
    let isSaved = false;

    if (session?.userId) {
      const [like, save] = await Promise.all([
        prisma.ugcLike.findUnique({
          where: {
            postId_userId: {
              postId: id,
              userId: session.userId,
            },
          },
        }),
        prisma.ugcSave.findUnique({
          where: {
            postId_userId: {
              postId: id,
              userId: session.userId,
            },
          },
        }),
      ]);
      isLiked = !!like;
      isSaved = !!save;
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
      ...post,
      mediaUrl: transformMediaUrl(post.mediaUrl),
      thumbnailUrl: transformMediaUrl(post.thumbnailUrl),
      isLiked,
      isSaved,
      isOwner,
    });
  } catch (error) {
    console.error('Error fetching post:', error);
    return NextResponse.json({ error: 'Failed to fetch post' }, { status: 500 });
  }
}

// DELETE /api/ugc/posts/[id] - Delete post (owner or admin)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { id } = await params;

    const post = await prisma.ugcPost.findUnique({
      where: { id },
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Check authorization
    if (post.userId !== session.userId && !session.isAdmin) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    // Delete file
    if (post.mediaUrl) {
      const filePath = path.join(process.cwd(), 'public', post.mediaUrl);
      try {
        await unlink(filePath);
      } catch {
        // File may not exist, continue with deletion
      }
    }

    // Delete thumbnail if exists
    if (post.thumbnailUrl) {
      const thumbPath = path.join(process.cwd(), 'public', post.thumbnailUrl);
      try {
        await unlink(thumbPath);
      } catch {
        // File may not exist
      }
    }

    // Delete post (cascades to likes, comments, saves, tags)
    await prisma.ugcPost.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting post:', error);
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 });
  }
}
