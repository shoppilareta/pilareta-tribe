import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';

// GET /api/admin/analytics — Analytics dashboard data (admin only)
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

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    // Run all queries in parallel
    const [
      signups,
      posts,
      workouts,
      wau,
      mau,
      topTypes,
      thisWeekUsers,
      lastWeekUsers,
      totalUsers,
    ] = await Promise.all([
      // User signups per day (last 30 days)
      prisma.$queryRaw<Array<{ date: Date; count: bigint }>>`
        SELECT DATE("createdAt") as date, COUNT(*) as count
        FROM "User"
        WHERE "createdAt" >= ${thirtyDaysAgo}
        GROUP BY DATE("createdAt")
        ORDER BY date
      `,

      // Posts per day (last 30 days)
      prisma.$queryRaw<Array<{ date: Date; count: bigint }>>`
        SELECT DATE("createdAt") as date, COUNT(*) as count
        FROM "UgcPost"
        WHERE "createdAt" >= ${thirtyDaysAgo} AND "deletedAt" IS NULL
        GROUP BY DATE("createdAt")
        ORDER BY date
      `,

      // Workouts per day (last 30 days)
      prisma.$queryRaw<Array<{ date: Date; count: bigint }>>`
        SELECT DATE("createdAt") as date, COUNT(*) as count
        FROM "WorkoutLog"
        WHERE "createdAt" >= ${thirtyDaysAgo}
        GROUP BY DATE("createdAt")
        ORDER BY date
      `,

      // Weekly active users (unique users with sessions in last 7 days)
      prisma.session.groupBy({
        by: ['userId'],
        where: { createdAt: { gte: weekAgo } },
      }).then((r) => r.length),

      // Monthly active users (unique users with sessions in last 30 days)
      prisma.session.groupBy({
        by: ['userId'],
        where: { createdAt: { gte: thirtyDaysAgo } },
      }).then((r) => r.length),

      // Top 5 workout types
      prisma.workoutLog.groupBy({
        by: ['workoutType'],
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 5,
      }),

      // New users this week
      prisma.user.count({ where: { createdAt: { gte: weekAgo } } }),

      // New users last week
      prisma.user.count({ where: { createdAt: { gte: twoWeeksAgo, lt: weekAgo } } }),

      // Total users
      prisma.user.count(),
    ]);

    // Serialize bigints to numbers for JSON
    const serializeTimeSeries = (data: Array<{ date: Date; count: bigint }>) =>
      data.map((row) => ({
        date: row.date.toISOString().split('T')[0],
        count: Number(row.count),
      }));

    return NextResponse.json({
      signups: serializeTimeSeries(signups),
      posts: serializeTimeSeries(posts),
      workouts: serializeTimeSeries(workouts),
      wau,
      mau,
      totalUsers,
      topTypes: topTypes.map((t) => ({
        workoutType: t.workoutType,
        count: t._count.id,
      })),
      growth: {
        thisWeek: thisWeekUsers,
        lastWeek: lastWeekUsers,
      },
    });
  } catch (error) {
    console.error('admin/analytics error:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
