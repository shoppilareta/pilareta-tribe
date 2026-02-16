import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/users/[id]/followers - List followers of a user
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params;
    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get('cursor');
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get followers (users who follow this user)
    const follows = await prisma.userFollow.findMany({
      where: { followingId: userId },
      take: limit + 1,
      ...(cursor && {
        cursor: { id: cursor },
        skip: 1,
      }),
      orderBy: { createdAt: 'desc' },
      include: {
        follower: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            profile: {
              select: {
                displayName: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    });

    const hasMore = follows.length > limit;
    const items = hasMore ? follows.slice(0, limit) : follows;
    const nextCursor = hasMore ? items[items.length - 1]?.id : null;

    return NextResponse.json({
      followers: items.map((f) => ({
        id: f.follower.id,
        firstName: f.follower.firstName,
        lastName: f.follower.lastName,
        displayName: f.follower.profile?.displayName || getDisplayName(f.follower),
        avatarUrl: f.follower.profile?.avatarUrl || null,
        followedAt: f.createdAt,
      })),
      nextCursor,
      hasMore,
    });
  } catch (error) {
    console.error('Error fetching followers:', error);
    return NextResponse.json({ error: 'Failed to fetch followers' }, { status: 500 });
  }
}

function getDisplayName(user: { firstName: string | null; lastName: string | null; email: string }): string {
  if (user.firstName && user.lastName) {
    return `${user.firstName} ${user.lastName}`;
  }
  if (user.firstName) {
    return user.firstName;
  }
  const emailPrefix = user.email.split('@')[0];
  return emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1);
}
