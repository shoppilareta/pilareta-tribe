import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { calculateStreak, getWeeklyProgress } from '@/lib/track/streak';

// GET /api/track/stats - Get user's workout stats
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Get cached stats from database
    let stats = await prisma.userWorkoutStats.findUnique({
      where: { userId: session.userId },
    });

    // If no stats exist, calculate them
    if (!stats) {
      const streak = await calculateStreak(session.userId);

      const totals = await prisma.workoutLog.aggregate({
        where: { userId: session.userId },
        _count: { id: true },
        _sum: { durationMinutes: true, calorieEstimate: true },
      });

      // Weekly minutes (last 7 days)
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      weekAgo.setHours(0, 0, 0, 0);

      const weeklyStats = await prisma.workoutLog.aggregate({
        where: {
          userId: session.userId,
          workoutDate: { gte: weekAgo },
        },
        _sum: { durationMinutes: true },
      });

      // Monthly minutes (last 30 days)
      const monthAgo = new Date();
      monthAgo.setDate(monthAgo.getDate() - 30);
      monthAgo.setHours(0, 0, 0, 0);

      const monthlyStats = await prisma.workoutLog.aggregate({
        where: {
          userId: session.userId,
          workoutDate: { gte: monthAgo },
        },
        _sum: { durationMinutes: true },
      });

      // Focus area counts
      const allLogs = await prisma.workoutLog.findMany({
        where: { userId: session.userId },
        select: { focusAreas: true },
      });

      const focusAreaCounts: Record<string, number> = {};
      allLogs.forEach((log) => {
        log.focusAreas.forEach((area) => {
          focusAreaCounts[area] = (focusAreaCounts[area] || 0) + 1;
        });
      });

      stats = await prisma.userWorkoutStats.create({
        data: {
          userId: session.userId,
          currentStreak: streak.currentStreak,
          longestStreak: streak.longestStreak,
          lastWorkoutDate: streak.lastWorkoutDate,
          streakStartDate: streak.streakStartDate,
          totalWorkouts: totals._count.id,
          totalMinutes: totals._sum.durationMinutes || 0,
          weeklyMinutes: weeklyStats._sum.durationMinutes || 0,
          monthlyMinutes: monthlyStats._sum.durationMinutes || 0,
          focusAreaCounts,
        },
      });
    }

    // Get weekly progress (Mon-Sun boolean array)
    const weeklyProgress = await getWeeklyProgress(session.userId);

    // Get workout type breakdown
    const workoutTypeCounts = await prisma.workoutLog.groupBy({
      by: ['workoutType'],
      where: { userId: session.userId },
      _count: { id: true },
    });

    const typeBreakdown = Object.fromEntries(
      workoutTypeCounts.map((item) => [item.workoutType, item._count.id])
    );

    // Get total calories
    const calorieTotal = await prisma.workoutLog.aggregate({
      where: { userId: session.userId },
      _sum: { calorieEstimate: true },
    });

    // Get average RPE
    const avgRpe = await prisma.workoutLog.aggregate({
      where: { userId: session.userId },
      _avg: { rpe: true },
    });

    return NextResponse.json({
      stats: {
        currentStreak: stats.currentStreak,
        longestStreak: stats.longestStreak,
        lastWorkoutDate: stats.lastWorkoutDate,
        streakStartDate: stats.streakStartDate,
        totalWorkouts: stats.totalWorkouts,
        totalMinutes: stats.totalMinutes,
        weeklyMinutes: stats.weeklyMinutes,
        monthlyMinutes: stats.monthlyMinutes,
        focusAreaCounts: stats.focusAreaCounts || {},
        totalCalories: calorieTotal._sum.calorieEstimate || 0,
        averageRpe: avgRpe._avg.rpe ? Math.round(avgRpe._avg.rpe * 10) / 10 : null,
        workoutTypeBreakdown: typeBreakdown,
      },
      weeklyProgress,
    });
  } catch (error) {
    console.error('Error fetching workout stats:', error);
    return NextResponse.json({ error: 'Failed to fetch workout stats' }, { status: 500 });
  }
}
