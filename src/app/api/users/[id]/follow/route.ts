import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { rateLimit } from '@/lib/rate-limit';
import { validateCsrf } from '@/lib/csrf';

// POST /api/users/[id]/follow - Follow a user
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const limiter = await rateLimit(request, { limit: 20, window: 60 });
    if (!limiter.success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    if (!validateCsrf(request)) {
      return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 });
    }

    const session = await getSession(request);
    if (!session?.userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { id: targetUserId } = await params;

    // Cannot follow yourself
    if (session.userId === targetUserId) {
      return NextResponse.json({ error: 'Cannot follow yourself' }, { status: 400 });
    }

    // Check target user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: { id: true },
    });

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if already following
    const existing = await prisma.userFollow.findUnique({
      where: {
        followerId_followingId: {
          followerId: session.userId,
          followingId: targetUserId,
        },
      },
    });

    if (existing) {
      return NextResponse.json({ error: 'Already following this user' }, { status: 409 });
    }

    // Create follow record
    await prisma.userFollow.create({
      data: {
        followerId: session.userId,
        followingId: targetUserId,
      },
    });

    return NextResponse.json({ success: true, following: true });
  } catch (error) {
    console.error('Error following user:', error);
    return NextResponse.json({ error: 'Failed to follow user' }, { status: 500 });
  }
}

// DELETE /api/users/[id]/follow - Unfollow a user
export async function DELETE(
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

    const { id: targetUserId } = await params;

    // Find and delete the follow record
    const existing = await prisma.userFollow.findUnique({
      where: {
        followerId_followingId: {
          followerId: session.userId,
          followingId: targetUserId,
        },
      },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Not following this user' }, { status: 404 });
    }

    await prisma.userFollow.delete({
      where: { id: existing.id },
    });

    return NextResponse.json({ success: true, following: false });
  } catch (error) {
    console.error('Error unfollowing user:', error);
    return NextResponse.json({ error: 'Failed to unfollow user' }, { status: 500 });
  }
}
