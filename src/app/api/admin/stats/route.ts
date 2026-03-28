import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { logger } from '@/lib/logger';

// GET /api/admin/stats — Dashboard statistics (admin only)
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
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      totalPosts,
      totalStudios,
      activeBanners,
      pendingPosts,
      recentSignups,
      recentPosts,
      totalWorkoutLogs,
      pendingClaims,
      pendingEditSuggestions,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.ugcPost.count(),
      prisma.studio.count(),
      prisma.shopBanner.count({ where: { isActive: true } }),
      prisma.ugcPost.count({ where: { status: 'pending' } }),
      prisma.user.findMany({
        where: { createdAt: { gte: sevenDaysAgo } },
        select: { id: true, email: true, firstName: true, lastName: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      prisma.ugcPost.findMany({
        where: { createdAt: { gte: sevenDaysAgo } },
        select: {
          id: true,
          caption: true,
          mediaType: true,
          status: true,
          createdAt: true,
          user: { select: { id: true, email: true, firstName: true, lastName: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      prisma.workoutLog.count(),
      prisma.studioClaim.count({ where: { status: 'pending' } }),
      prisma.studioEditSuggestion.count({ where: { status: 'pending' } }),
    ]);

    // Signups in last 30 days for trend
    const signupsLast30Days = await prisma.user.count({
      where: { createdAt: { gte: thirtyDaysAgo } },
    });

    return NextResponse.json({
      counts: {
        totalUsers,
        totalPosts,
        totalStudios,
        activeBanners,
        pendingPosts,
        totalWorkoutLogs,
        pendingClaims,
        pendingEditSuggestions,
        signupsLast30Days,
      },
      recentSignups,
      recentPosts,
    });
  } catch (error) {
    logger.error('admin/stats', 'Failed to fetch admin stats', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
