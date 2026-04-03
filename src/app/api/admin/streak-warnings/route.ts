import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { notifyStreakWarning } from '@/lib/social-notifications';
import { logger } from '@/lib/logger';

/**
 * POST /api/admin/streak-warnings
 *
 * Sends streak warning notifications to users whose streak is at risk.
 * A streak is at risk when the user's last workout was yesterday (they haven't
 * worked out today yet) and their current streak is >= 3 days.
 *
 * Should be called daily by a cron job (e.g., at 6pm local time).
 * Admin-only endpoint.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getSession(request);
    if (!session?.isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Find users with active streaks >= 3 whose last workout was yesterday
    // (they haven't worked out today yet, so streak is at risk)
    const atRiskUsers = await prisma.userWorkoutStats.findMany({
      where: {
        currentStreak: { gte: 3 },
        lastWorkoutDate: yesterday,
      },
      select: {
        userId: true,
        currentStreak: true,
      },
    });

    let sentCount = 0;
    for (const user of atRiskUsers) {
      await notifyStreakWarning(user.userId, user.currentStreak);
      sentCount++;
    }

    logger.info('admin/streak-warnings', `Sent ${sentCount} streak warning notifications`);

    return NextResponse.json({
      success: true,
      usersNotified: sentCount,
      totalAtRisk: atRiskUsers.length,
    });
  } catch (error) {
    logger.error('admin/streak-warnings', 'Failed to process streak warnings', error);
    return NextResponse.json({ error: 'Failed to process streak warnings' }, { status: 500 });
  }
}
