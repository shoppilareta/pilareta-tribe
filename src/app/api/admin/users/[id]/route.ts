import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { logger } from '@/lib/logger';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/admin/users/[id] — Get user details (admin only)
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession(request);
    if (!session?.userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    const adminUser = await prisma.user.findUnique({ where: { id: session.userId } });
    if (!adminUser?.isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { id } = await params;
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        isAdmin: true,
        shopifyId: true,
        createdAt: true,
        updatedAt: true,
        profile: {
          select: {
            displayName: true,
            bio: true,
            avatarUrl: true,
            fitnessGoal: true,
          },
        },
        _count: {
          select: {
            ugcPosts: true,
            ugcComments: true,
            ugcLikes: true,
            workoutLogs: true,
            followers: true,
            following: true,
            sessions: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    logger.error('admin/users', 'Failed to fetch user', error);
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
  }
}

// PATCH /api/admin/users/[id] — Update user (admin only)
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession(request);
    if (!session?.userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    const adminUser = await prisma.user.findUnique({ where: { id: session.userId } });
    if (!adminUser?.isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();

    // Prevent admin from removing their own admin status
    if (id === session.userId && body.isAdmin === false) {
      return NextResponse.json(
        { error: 'Cannot remove your own admin status' },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = {};
    if (body.isAdmin !== undefined) updateData.isAdmin = body.isAdmin;
    if (body.firstName !== undefined) updateData.firstName = body.firstName;
    if (body.lastName !== undefined) updateData.lastName = body.lastName;

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        isAdmin: true,
        createdAt: true,
      },
    });

    logger.info('admin/users', `Updated user ${id}`, { adminUserId: session.userId });

    return NextResponse.json({ user });
  } catch (error) {
    logger.error('admin/users', 'Failed to update user', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}
