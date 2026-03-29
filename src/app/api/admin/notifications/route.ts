import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { sendPushNotifications } from '@/lib/push';
import { logger } from '@/lib/logger';
import { logAdminAction } from '@/lib/admin/audit';
import type { Prisma } from '@prisma/client';

// GET /api/admin/notifications — List past and scheduled notifications (admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await getSession(request);
    if (!session?.userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    const user = await prisma.user.findUnique({ where: { id: session.userId } });
    if (!user?.isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const notifications = await prisma.adminNotification.findMany({
      orderBy: { sentAt: 'desc' },
      take: 50,
    });

    return NextResponse.json({ notifications });
  } catch (error) {
    logger.error('admin/notifications', 'Failed to fetch notifications', error);
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
}

// Helper: fetch push tokens and send notification immediately
async function sendNotificationNow(
  title: string,
  body: string,
  targetSegment: string,
  dataPayload: Record<string, unknown> | undefined,
  sentBy: string
) {
  // Fetch push tokens based on segment
  let pushTokens;
  if (targetSegment === 'active') {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const activeUserIds = await prisma.workoutLog.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      select: { userId: true },
      distinct: ['userId'],
    });

    const userIds = activeUserIds.map((u) => u.userId);
    pushTokens = await prisma.pushToken.findMany({
      where: { userId: { in: userIds } },
      select: { token: true },
    });
  } else {
    pushTokens = await prisma.pushToken.findMany({
      select: { token: true },
    });
  }

  const tokens = pushTokens.map((pt) => pt.token);

  if (tokens.length === 0) {
    return { tokens: [], result: { totalSent: 0, successCount: 0, failureCount: 0 } };
  }

  const result = await sendPushNotifications(tokens, title, body, dataPayload);
  return { tokens, result };
}

// POST /api/admin/notifications — Send or schedule a push notification
export async function POST(request: NextRequest) {
  try {
    const session = await getSession(request);
    if (!session?.userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    const user = await prisma.user.findUnique({ where: { id: session.userId } });
    if (!user?.isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { title, body, data, segment, scheduledFor } = await request.json();

    if (!title || typeof title !== 'string' || !title.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }
    if (title.length > 200) {
      return NextResponse.json({ error: 'Title too long (max 200 characters)' }, { status: 400 });
    }
    if (!body || typeof body !== 'string' || !body.trim()) {
      return NextResponse.json({ error: 'Body is required' }, { status: 400 });
    }
    if (body.length > 2000) {
      return NextResponse.json({ error: 'Body too long (max 2000 characters)' }, { status: 400 });
    }

    const validSegments = ['all', 'active'];
    const targetSegment = validSegments.includes(segment) ? segment : 'all';

    // Parse optional data payload
    let dataPayload: Record<string, unknown> | undefined;
    if (data) {
      if (typeof data === 'string') {
        try {
          dataPayload = JSON.parse(data);
        } catch {
          return NextResponse.json({ error: 'Invalid JSON in data field' }, { status: 400 });
        }
      } else if (typeof data === 'object') {
        dataPayload = data;
      }
    }

    // Check if this is a scheduled notification
    const scheduledDate = scheduledFor ? new Date(scheduledFor) : null;
    const isScheduled = scheduledDate && scheduledDate > new Date();

    if (isScheduled) {
      // Save as scheduled — don't send yet
      // NOTE: A cron job is needed to actually send scheduled notifications at the right time.
      // For now, the admin can use the "Send Now" button to manually trigger sending.
      const notification = await prisma.adminNotification.create({
        data: {
          title: title.trim(),
          body: body.trim(),
          data: (dataPayload as Prisma.InputJsonValue) ?? undefined,
          segment: targetSegment,
          scheduledFor: scheduledDate,
          status: 'scheduled',
          sentBy: session.userId,
          recipientCount: 0,
        },
      });

      await logAdminAction(session.userId, 'schedule', 'notification', notification.id, {
        title: title.trim(),
        segment: targetSegment,
        scheduledFor: scheduledDate.toISOString(),
      });

      return NextResponse.json({
        notification,
        result: { totalSent: 0, successCount: 0, failureCount: 0 },
        message: `Notification scheduled for ${scheduledDate.toISOString()}`,
      }, { status: 201 });
    }

    // Send immediately
    const { tokens, result } = await sendNotificationNow(
      title.trim(),
      body.trim(),
      targetSegment,
      dataPayload,
      session.userId
    );

    if (tokens.length === 0) {
      return NextResponse.json({
        notification: null,
        result: { totalSent: 0, successCount: 0, failureCount: 0 },
        message: 'No push tokens found for the selected segment',
      }, { status: 200 });
    }

    const notification = await prisma.adminNotification.create({
      data: {
        title: title.trim(),
        body: body.trim(),
        data: (dataPayload as Prisma.InputJsonValue) ?? undefined,
        segment: targetSegment,
        status: 'sent',
        sentBy: session.userId,
        recipientCount: result.totalSent,
      },
    });

    await logAdminAction(session.userId, 'send', 'notification', notification.id, {
      title: title.trim(),
      segment: targetSegment,
      recipientCount: result.totalSent,
    });

    return NextResponse.json({
      notification,
      result: {
        totalSent: result.totalSent,
        successCount: result.successCount,
        failureCount: result.failureCount,
      },
    }, { status: 201 });
  } catch (error) {
    logger.error('admin/notifications', 'Failed to send notification', error);
    return NextResponse.json({ error: 'Failed to send notification' }, { status: 500 });
  }
}

// PATCH /api/admin/notifications — Send now or cancel a scheduled notification
export async function PATCH(request: NextRequest) {
  try {
    const session = await getSession(request);
    if (!session?.userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    const user = await prisma.user.findUnique({ where: { id: session.userId } });
    if (!user?.isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { notificationId, action } = await request.json();

    if (!notificationId || !action) {
      return NextResponse.json({ error: 'notificationId and action are required' }, { status: 400 });
    }

    if (!['send_now', 'cancel'].includes(action)) {
      return NextResponse.json({ error: 'action must be "send_now" or "cancel"' }, { status: 400 });
    }

    const notification = await prisma.adminNotification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
    }

    if (notification.status !== 'scheduled') {
      return NextResponse.json({ error: 'Only scheduled notifications can be modified' }, { status: 400 });
    }

    if (action === 'cancel') {
      const updated = await prisma.adminNotification.update({
        where: { id: notificationId },
        data: { status: 'cancelled' },
      });

      await logAdminAction(session.userId, 'cancel', 'notification', notificationId, {
        title: notification.title,
      });

      return NextResponse.json({ notification: updated });
    }

    // action === 'send_now' — send the scheduled notification immediately
    const dataPayload = notification.data as Record<string, unknown> | undefined;
    const { tokens, result } = await sendNotificationNow(
      notification.title,
      notification.body,
      notification.segment,
      dataPayload ?? undefined,
      session.userId
    );

    if (tokens.length === 0) {
      return NextResponse.json({
        notification,
        result: { totalSent: 0, successCount: 0, failureCount: 0 },
        message: 'No push tokens found for the selected segment',
      }, { status: 200 });
    }

    const updated = await prisma.adminNotification.update({
      where: { id: notificationId },
      data: {
        status: 'sent',
        sentAt: new Date(),
        recipientCount: result.totalSent,
      },
    });

    await logAdminAction(session.userId, 'send_now', 'notification', notificationId, {
      title: notification.title,
      recipientCount: result.totalSent,
    });

    return NextResponse.json({
      notification: updated,
      result: {
        totalSent: result.totalSent,
        successCount: result.successCount,
        failureCount: result.failureCount,
      },
    });
  } catch (error) {
    logger.error('admin/notifications', 'Failed to update notification', error);
    return NextResponse.json({ error: 'Failed to update notification' }, { status: 500 });
  }
}
