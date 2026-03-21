import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/users/[id]/following - List users that a user is following
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params;
    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get('cursor');
    const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '20', 10), 1), 100);

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get following (users this user follows)
    const follows = await prisma.userFollow.findMany({
      where: { followerId: userId },
      take: limit + 1,
      ...(cursor && {
        cursor: { id: cursor },
        skip: 1,
      }),
      orderBy: { createdAt: 'desc' },
      include: {
        following: {
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
      following: items.map((f) => ({
        id: f.following.id,
        firstName: f.following.firstName,
        lastName: f.following.lastName,
        displayName: f.following.profile?.displayName || getDisplayName(f.following),
        avatarUrl: f.following.profile?.avatarUrl || null,
        followedAt: f.createdAt,
      })),
      nextCursor,
      hasMore,
    });
  } catch (error) {
    console.error('Error fetching following:', error);
    return NextResponse.json({ error: 'Failed to fetch following' }, { status: 500 });
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
