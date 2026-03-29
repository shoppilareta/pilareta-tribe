import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { logAdminAction } from '@/lib/admin/audit';

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
        deactivated: true,
        bannedAt: true,
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

    // Prevent admin from deactivating/banning themselves
    if (id === session.userId && (body.deactivated === true || body.bannedAt)) {
      return NextResponse.json(
        { error: 'Cannot deactivate or ban yourself' },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = {};
    if (body.isAdmin !== undefined) updateData.isAdmin = body.isAdmin;
    if (body.firstName !== undefined) updateData.firstName = body.firstName;
    if (body.lastName !== undefined) updateData.lastName = body.lastName;
    if (body.deactivated !== undefined) updateData.deactivated = body.deactivated;
    if (body.bannedAt !== undefined) updateData.bannedAt = body.bannedAt ? new Date(body.bannedAt) : null;

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        isAdmin: true,
        deactivated: true,
        bannedAt: true,
        createdAt: true,
      },
    });

    // If user was banned or deactivated, delete all their sessions
    if (body.deactivated === true || body.bannedAt) {
      await prisma.session.deleteMany({ where: { userId: id } });
      logger.info('admin/users', `Cleared sessions for user ${id} (deactivated/banned)`, { adminUserId: session.userId });
    }

    logger.info('admin/users', `Updated user ${id}`, { adminUserId: session.userId });
    await logAdminAction(session.userId, 'update', 'user', id, { updatedFields: Object.keys(updateData) });

    return NextResponse.json({ user });
  } catch (error) {
    logger.error('admin/users', 'Failed to update user', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}

// DELETE /api/admin/users/[id] — Soft-deactivate user (admin only)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
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

    // Prevent admin from deactivating themselves
    if (id === session.userId) {
      return NextResponse.json(
        { error: 'Cannot deactivate yourself' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    await prisma.user.update({
      where: { id },
      data: { deactivated: true },
    });
    await prisma.session.deleteMany({ where: { userId: id } });

    logger.info('admin/users', `Deactivated user ${id} (${user.email})`, { adminUserId: session.userId });
    await logAdminAction(session.userId, 'deactivate', 'user', id, { email: user.email });

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('admin/users', 'Failed to deactivate user', error);
    return NextResponse.json({ error: 'Failed to deactivate user' }, { status: 500 });
  }
}
