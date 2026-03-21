import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';

// GET /api/users/search?q=query - Search users by name or email
export async function GET(request: NextRequest) {
  try {
    const session = await getSession(request);
    if (!session?.userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.trim();
    const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '20', 10), 1), 100);

    if (query && query.length > 200) {
      return NextResponse.json({ error: 'Query too long' }, { status: 400 });
    }

    if (!query || query.length < 2) {
      return NextResponse.json({ error: 'Search query must be at least 2 characters' }, { status: 400 });
    }

    // Search by firstName, lastName, displayName, or email prefix
    const users = await prisma.user.findMany({
      where: {
        AND: [
          { id: { not: session.userId } }, // Exclude current user
          {
            OR: [
              { firstName: { contains: query, mode: 'insensitive' } },
              { lastName: { contains: query, mode: 'insensitive' } },
              { email: { contains: query, mode: 'insensitive' } },
              {
                profile: {
                  displayName: { contains: query, mode: 'insensitive' },
                },
              },
            ],
          },
        ],
      },
      take: limit,
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
        _count: {
          select: {
            followers: true,
            following: true,
          },
        },
      },
    });

    // Check which users the current user is already following
    const userIds = users.map((u) => u.id);
    const existingFollows = await prisma.userFollow.findMany({
      where: {
        followerId: session.userId,
        followingId: { in: userIds },
      },
      select: { followingId: true },
    });
    const followingIds = new Set(existingFollows.map((f) => f.followingId));

    return NextResponse.json({
      users: users.map((u) => ({
        id: u.id,
        firstName: u.firstName,
        lastName: u.lastName,
        displayName: u.profile?.displayName || getDisplayName(u),
        avatarUrl: u.profile?.avatarUrl || null,
        followersCount: u._count.followers,
        followingCount: u._count.following,
        isFollowing: followingIds.has(u.id),
      })),
    });
  } catch (error) {
    console.error('Error searching users:', error);
    return NextResponse.json({ error: 'Failed to search users' }, { status: 500 });
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
