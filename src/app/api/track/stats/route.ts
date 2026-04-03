import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { getWeeklyProgress } from '@/lib/track/streak';
import { logger } from '@/lib/logger';

// GET /api/track/stats - Get user's workout stats
export async function GET(request: NextRequest) {
  try {
    const session = await getSession(request);
    if (!session?.userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Get cached stats from database
    let stats = await prisma.userWorkoutStats.findUnique({
      where: { userId: session.userId },
    });

    // If no stats exist, create with zeros and return immediately.
    // Stats are properly calculated when a workout is logged (via updateUserStats).
    if (!stats) {
      stats = await prisma.userWorkoutStats.create({
        data: {
          userId: session.userId,
          currentStreak: 0,
          longestStreak: 0,
          lastWorkoutDate: null,
          streakStartDate: null,
          totalWorkouts: 0,
          totalMinutes: 0,
          weeklyMinutes: 0,
          monthlyMinutes: 0,
          focusAreaCounts: {},
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

    // Monthly workout count (current calendar month)
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const monthlyWorkoutCount = await prisma.workoutLog.count({
      where: {
        userId: session.userId,
        workoutDate: { gte: monthStart },
      },
    });

    // Weekly workout count (from weeklyProgress)
    const weeklyWorkouts = weeklyProgress.filter(Boolean).length;

    // --- Weekly Trend (last 4 weeks) ---
    const fourWeeksAgo = new Date();
    fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);
    fourWeeksAgo.setHours(0, 0, 0, 0);

    const recentLogs = await prisma.workoutLog.findMany({
      where: { userId: session.userId, workoutDate: { gte: fourWeeksAgo } },
      select: { workoutDate: true, durationMinutes: true },
    });

    // Group by week: w=3 is 4 weeks ago, w=0 is this week
    const weeklyTrend: { label: string; minutes: number }[] = [];
    const now = new Date();
    for (let w = 3; w >= 0; w--) {
      const start = new Date(now);
      start.setDate(now.getDate() - (w + 1) * 7 + 1);
      start.setHours(0, 0, 0, 0);
      const end = new Date(now);
      end.setDate(now.getDate() - w * 7);
      end.setHours(23, 59, 59, 999);

      const weekMinutes = recentLogs
        .filter((log) => {
          const d = new Date(log.workoutDate);
          return d >= start && d <= end;
        })
        .reduce((sum, log) => sum + log.durationMinutes, 0);

      const label = `${start.getDate()}/${start.getMonth() + 1}`;
      weeklyTrend.push({ label, minutes: weekMinutes });
    }

    // --- Personal Records ---
    const longestSessionResult = await prisma.workoutLog.aggregate({
      where: { userId: session.userId },
      _max: { durationMinutes: true },
    });

    // Most active week: find week with most workouts from all logs
    const allDates = await prisma.workoutLog.findMany({
      where: { userId: session.userId },
      select: { workoutDate: true },
      orderBy: { workoutDate: 'asc' },
    });

    let mostActiveWeekWorkouts = 0;
    if (allDates.length > 0) {
      // Group by ISO week
      const weekCounts: Record<string, number> = {};
      for (const log of allDates) {
        const d = new Date(log.workoutDate);
        // Get Monday-based week key
        const dayOfWeek = d.getDay();
        const monday = new Date(d);
        monday.setDate(d.getDate() - ((dayOfWeek + 6) % 7));
        const weekKey = `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, '0')}-${String(monday.getDate()).padStart(2, '0')}`;
        weekCounts[weekKey] = (weekCounts[weekKey] || 0) + 1;
      }
      mostActiveWeekWorkouts = Math.max(...Object.values(weekCounts));
    }

    const personalRecords = {
      longestSession: longestSessionResult._max.durationMinutes || 0,
      mostActiveWeekWorkouts,
      bestStreak: stats.longestStreak,
    };

    // --- Focus Area Balance Recommendation ---
    const focusCounts = (stats.focusAreaCounts || {}) as Record<string, number>;
    const allFocusAreas = ['core', 'glutes', 'legs', 'arms', 'back', 'posture', 'mobility'];
    let focusAreaRecommendation: string | null = null;

    if (stats.totalWorkouts >= 5) {
      const totalTagged = Object.values(focusCounts).reduce((a, b) => a + b, 0);
      if (totalTagged > 0) {
        // Find the most neglected focus area
        let minArea = '';
        let minCount = Infinity;
        for (const area of allFocusAreas) {
          const count = focusCounts[area] || 0;
          if (count < minCount) {
            minCount = count;
            minArea = area;
          }
        }

        // Find the most popular area for comparison
        const maxCount = Math.max(...allFocusAreas.map((a) => focusCounts[a] || 0));

        // Recommend if there's a significant imbalance (3x+ difference or zero)
        if (maxCount > 0 && (minCount === 0 || maxCount / minCount >= 3)) {
          const areaLabel = minArea.charAt(0).toUpperCase() + minArea.slice(1);
          if (minCount === 0) {
            focusAreaRecommendation = `You haven't targeted ${areaLabel.toLowerCase()} yet — try adding it to your next session for better balance.`;
          } else {
            focusAreaRecommendation = `Your ${areaLabel.toLowerCase()} focus area is underrepresented (${minCount} vs ${maxCount} sessions). Consider balancing your routine.`;
          }
        }
      }
    }

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
        weeklyWorkoutGoal: stats.weeklyWorkoutGoal ?? null,
        weeklyMinuteGoal: stats.weeklyMinuteGoal ?? null,
        weeklyWorkouts,
        monthlyWorkouts: monthlyWorkoutCount,
        weeklyTrend,
        personalRecords,
      },
      weeklyProgress,
      focusAreaRecommendation,
    });
  } catch (error) {
    logger.error('track/stats', 'Failed to fetch workout stats', error);
    return NextResponse.json({ error: 'Failed to fetch workout stats' }, { status: 500 });
  }
}

// PATCH /api/track/stats - Update user's workout goals
export async function PATCH(request: NextRequest) {
  try {
    const session = await getSession(request);
    if (!session?.userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { weeklyWorkoutGoal, weeklyMinuteGoal } = await request.json();

    // Validate inputs
    if (weeklyWorkoutGoal !== undefined && weeklyWorkoutGoal !== null) {
      if (!Number.isInteger(weeklyWorkoutGoal) || weeklyWorkoutGoal < 1 || weeklyWorkoutGoal > 7) {
        return NextResponse.json({ error: 'weeklyWorkoutGoal must be between 1 and 7' }, { status: 400 });
      }
    }
    if (weeklyMinuteGoal !== undefined && weeklyMinuteGoal !== null) {
      if (!Number.isInteger(weeklyMinuteGoal) || weeklyMinuteGoal < 30 || weeklyMinuteGoal > 600) {
        return NextResponse.json({ error: 'weeklyMinuteGoal must be between 30 and 600' }, { status: 400 });
      }
    }

    await prisma.userWorkoutStats.upsert({
      where: { userId: session.userId },
      update: {
        weeklyWorkoutGoal: weeklyWorkoutGoal ?? null,
        weeklyMinuteGoal: weeklyMinuteGoal ?? null,
      },
      create: {
        userId: session.userId,
        weeklyWorkoutGoal: weeklyWorkoutGoal ?? null,
        weeklyMinuteGoal: weeklyMinuteGoal ?? null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('track/stats', 'Failed to update workout goals', error);
    return NextResponse.json({ error: 'Failed to update goals' }, { status: 500 });
  }
}
