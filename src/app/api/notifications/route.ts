import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { logger } from '@/lib/logger';

// GET /api/notifications - Get user's in-app notifications
export async function GET(request: NextRequest) {
  try {
    const session = await getSession(request);
    if (!session?.userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get('cursor');
    const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '20', 10), 1), 50);
    const unreadOnly = searchParams.get('unread') === 'true';

    const notifications = await prisma.inAppNotification.findMany({
      where: {
        userId: session.userId,
        ...(unreadOnly && { isRead: false }),
      },
      take: limit + 1,
      ...(cursor && {
        cursor: { id: cursor },
        skip: 1,
      }),
      orderBy: { createdAt: 'desc' },
    });

    const hasMore = notifications.length > limit;
    const items = hasMore ? notifications.slice(0, limit) : notifications;
    const nextCursor = hasMore ? items[items.length - 1]?.id : null;

    // Get unread count
    const unreadCount = await prisma.inAppNotification.count({
      where: { userId: session.userId, isRead: false },
    });

    return NextResponse.json({
      notifications: items,
      nextCursor,
      hasMore,
      unreadCount,
    });
  } catch (error) {
    logger.error('notifications', 'Failed to fetch notifications', error);
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
}

// PATCH /api/notifications - Mark notifications as read
export async function PATCH(request: NextRequest) {
  try {
    const session = await getSession(request);
    if (!session?.userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const { notificationIds, markAllRead } = body;

    if (markAllRead) {
      await prisma.inAppNotification.updateMany({
        where: { userId: session.userId, isRead: false },
        data: { isRead: true, readAt: new Date() },
      });
    } else if (Array.isArray(notificationIds) && notificationIds.length > 0) {
      await prisma.inAppNotification.updateMany({
        where: {
          id: { in: notificationIds },
          userId: session.userId,
        },
        data: { isRead: true, readAt: new Date() },
      });
    } else {
      return NextResponse.json({ error: 'Provide notificationIds or markAllRead' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('notifications', 'Failed to mark notifications as read', error);
    return NextResponse.json({ error: 'Failed to update notifications' }, { status: 500 });
  }
}
