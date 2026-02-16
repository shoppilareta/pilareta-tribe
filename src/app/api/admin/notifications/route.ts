import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { sendPushNotifications } from '@/lib/push';
import type { Prisma } from '@prisma/client';

// GET /api/admin/notifications — List past notifications (admin only)
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
    console.error('Error fetching notifications:', error);
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
}

// POST /api/admin/notifications — Send push notification to all or a segment of users
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

    const { title, body, data, segment } = await request.json();

    if (!title || typeof title !== 'string' || !title.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }
    if (!body || typeof body !== 'string' || !body.trim()) {
      return NextResponse.json({ error: 'Body is required' }, { status: 400 });
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

    // Fetch push tokens based on segment
    let pushTokens;
    if (targetSegment === 'active') {
      // Active = users who have logged a workout in the last 30 days
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
      // All tokens
      pushTokens = await prisma.pushToken.findMany({
        select: { token: true },
      });
    }

    const tokens = pushTokens.map((pt) => pt.token);

    // Send via Expo Push API
    const result = await sendPushNotifications(
      tokens,
      title.trim(),
      body.trim(),
      dataPayload
    );

    // Save to AdminNotification
    const notification = await prisma.adminNotification.create({
      data: {
        title: title.trim(),
        body: body.trim(),
        data: (dataPayload as Prisma.InputJsonValue) ?? undefined,
        segment: targetSegment,
        sentBy: session.userId,
        recipientCount: result.totalSent,
      },
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
    console.error('Error sending notification:', error);
    return NextResponse.json({ error: 'Failed to send notification' }, { status: 500 });
  }
}
