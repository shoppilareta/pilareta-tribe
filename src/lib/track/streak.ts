import { prisma } from '@/lib/db';

interface StreakResult {
  currentStreak: number;
  longestStreak: number;
  lastWorkoutDate: Date | null;
  streakStartDate: Date | null;
}

/**
 * Calculate user's workout streak
 * Rules:
 * - A streak day = at least one workout logged on that calendar day
 * - Grace period: streak continues if last workout was yesterday
 * - Multiple logs same day count as 1 streak day
 * - Backfilled logs recalculate streak
 */
export async function calculateStreak(userId: string): Promise<StreakResult> {
  // Get all workout dates for user, ordered by date descending
  const logs = await prisma.workoutLog.findMany({
    where: { userId },
    select: { workoutDate: true },
    orderBy: { workoutDate: 'desc' },
  });

  if (logs.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      lastWorkoutDate: null,
      streakStartDate: null,
    };
  }

  // Get unique dates (as ISO date strings for comparison)
  const uniqueDates = [...new Set(
    logs.map(l => l.workoutDate.toISOString().split('T')[0])
  )].sort().reverse();

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split('T')[0];

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  // Calculate current streak
  let currentStreak = 0;
  let streakStartDate: Date | null = null;

  // Check if user worked out today or yesterday (grace period)
  if (uniqueDates[0] === todayStr || uniqueDates[0] === yesterdayStr) {
    currentStreak = 1;
    streakStartDate = new Date(uniqueDates[0]);

    // Count consecutive days backwards
    let expectedDate = new Date(uniqueDates[0]);

    for (let i = 1; i < uniqueDates.length; i++) {
      expectedDate.setDate(expectedDate.getDate() - 1);
      const expectedStr = expectedDate.toISOString().split('T')[0];

      if (uniqueDates[i] === expectedStr) {
        currentStreak++;
        streakStartDate = new Date(uniqueDates[i]);
      } else {
        break;
      }
    }
  }

  // Calculate longest streak
  let longestStreak = 0;
  let tempStreak = 1;

  for (let i = 1; i < uniqueDates.length; i++) {
    const prevDate = new Date(uniqueDates[i - 1]);
    const currDate = new Date(uniqueDates[i]);

    prevDate.setDate(prevDate.getDate() - 1);
    const expectedStr = prevDate.toISOString().split('T')[0];

    if (uniqueDates[i] === expectedStr) {
      tempStreak++;
    } else {
      longestStreak = Math.max(longestStreak, tempStreak);
      tempStreak = 1;
    }
  }
  longestStreak = Math.max(longestStreak, tempStreak, currentStreak);

  return {
    currentStreak,
    longestStreak,
    lastWorkoutDate: new Date(uniqueDates[0]),
    streakStartDate,
  };
}

/**
 * Update user's workout stats after a new log
 */
export async function updateUserStats(userId: string): Promise<void> {
  const streak = await calculateStreak(userId);

  // Calculate total workouts and minutes
  const totals = await prisma.workoutLog.aggregate({
    where: { userId },
    _count: { id: true },
    _sum: { durationMinutes: true },
  });

  // Weekly minutes (last 7 days)
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  weekAgo.setHours(0, 0, 0, 0);

  const weeklyStats = await prisma.workoutLog.aggregate({
    where: {
      userId,
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
      userId,
      workoutDate: { gte: monthAgo },
    },
    _sum: { durationMinutes: true },
  });

  // Focus area counts
  const allLogs = await prisma.workoutLog.findMany({
    where: { userId },
    select: { focusAreas: true },
  });

  const focusAreaCounts: Record<string, number> = {};
  allLogs.forEach(log => {
    log.focusAreas.forEach(area => {
      focusAreaCounts[area] = (focusAreaCounts[area] || 0) + 1;
    });
  });

  // Upsert stats
  await prisma.userWorkoutStats.upsert({
    where: { userId },
    create: {
      userId,
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
    update: {
      currentStreak: streak.currentStreak,
      longestStreak: Math.max(streak.longestStreak, streak.currentStreak),
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

/**
 * Get this week's workout days (for weekly progress display)
 */
export async function getWeeklyProgress(userId: string): Promise<boolean[]> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Get start of week (Monday)
  const startOfWeek = new Date(today);
  const dayOfWeek = today.getDay();
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Adjust to Monday
  startOfWeek.setDate(today.getDate() + diff);

  const logs = await prisma.workoutLog.findMany({
    where: {
      userId,
      workoutDate: {
        gte: startOfWeek,
        lte: today,
      },
    },
    select: { workoutDate: true },
  });

  const loggedDates = new Set(
    logs.map(l => l.workoutDate.toISOString().split('T')[0])
  );

  // Create array for Mon-Sun (7 days)
  const weekProgress: boolean[] = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];
    weekProgress.push(loggedDates.has(dateStr));
  }

  return weekProgress;
}
