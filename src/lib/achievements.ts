/**
 * Achievement Detection System
 *
 * Checks user stats against achievement thresholds and awards new achievements.
 * Called after workout logging, post creation, program completion, etc.
 */

import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';

// Seed data for achievements — call ensureAchievementsExist() on app startup or first check
const ACHIEVEMENT_DEFINITIONS = [
  // Workout milestones
  { slug: 'first-workout', name: 'First Step', description: 'Log your first workout', category: 'workout', threshold: 1, metric: 'total_workouts' },
  { slug: '10-workouts', name: 'Getting Started', description: 'Complete 10 workouts', category: 'workout', threshold: 10, metric: 'total_workouts' },
  { slug: '50-workouts', name: 'Dedicated', description: 'Complete 50 workouts', category: 'workout', threshold: 50, metric: 'total_workouts' },
  { slug: '100-workouts', name: 'Century Club', description: 'Complete 100 workouts', category: 'workout', threshold: 100, metric: 'total_workouts' },
  { slug: '250-workouts', name: 'Unstoppable', description: 'Complete 250 workouts', category: 'workout', threshold: 250, metric: 'total_workouts' },

  // Streak milestones
  { slug: '7-day-streak', name: 'Week Warrior', description: 'Maintain a 7-day streak', category: 'streak', threshold: 7, metric: 'current_streak' },
  { slug: '14-day-streak', name: 'Two-Week Titan', description: 'Maintain a 14-day streak', category: 'streak', threshold: 14, metric: 'current_streak' },
  { slug: '30-day-streak', name: 'Monthly Master', description: 'Maintain a 30-day streak', category: 'streak', threshold: 30, metric: 'current_streak' },
  { slug: '60-day-streak', name: 'Iron Will', description: 'Maintain a 60-day streak', category: 'streak', threshold: 60, metric: 'current_streak' },
  { slug: '100-day-streak', name: 'Legendary', description: 'Maintain a 100-day streak', category: 'streak', threshold: 100, metric: 'current_streak' },

  // Community milestones
  { slug: 'first-post', name: 'Community Contributor', description: 'Share your first post', category: 'community', threshold: 1, metric: 'ugc_posts' },
  { slug: '10-posts', name: 'Active Sharer', description: 'Share 10 posts', category: 'community', threshold: 10, metric: 'ugc_posts' },

  // Program milestones
  { slug: 'first-program', name: 'Program Graduate', description: 'Complete your first program', category: 'program', threshold: 1, metric: 'programs_completed' },
  { slug: '3-programs', name: 'Program Veteran', description: 'Complete 3 programs', category: 'program', threshold: 3, metric: 'programs_completed' },

  // Total minutes
  { slug: '100-minutes', name: 'Hour Power', description: 'Log 100 total minutes', category: 'milestone', threshold: 100, metric: 'total_minutes' },
  { slug: '500-minutes', name: 'Half Thousand', description: 'Log 500 total minutes', category: 'milestone', threshold: 500, metric: 'total_minutes' },
  { slug: '1000-minutes', name: 'Millennium', description: 'Log 1,000 total minutes', category: 'milestone', threshold: 1000, metric: 'total_minutes' },
  { slug: '5000-minutes', name: 'Five Thousand', description: 'Log 5,000 total minutes', category: 'milestone', threshold: 5000, metric: 'total_minutes' },

  // Focus area balance
  { slug: 'balanced-5', name: 'Well-Rounded', description: 'Log workouts targeting 5 different focus areas', category: 'milestone', threshold: 5, metric: 'focus_areas_covered' },

  // Studio explorer
  { slug: '3-studios', name: 'Studio Explorer', description: 'Log workouts at 3 different studios', category: 'studio', threshold: 3, metric: 'studios_visited' },
  { slug: '10-studios', name: 'Studio Hopper', description: 'Log workouts at 10 different studios', category: 'studio', threshold: 10, metric: 'studios_visited' },
];

/**
 * Ensure all achievement definitions exist in the database.
 * Uses upsert so it's safe to call multiple times.
 */
export async function ensureAchievementsExist(): Promise<void> {
  for (const def of ACHIEVEMENT_DEFINITIONS) {
    await prisma.achievement.upsert({
      where: { slug: def.slug },
      update: { name: def.name, description: def.description },
      create: def,
    });
  }
}

/**
 * Get the current value for a given metric for a user.
 */
async function getMetricValue(userId: string, metric: string): Promise<number> {
  switch (metric) {
    case 'total_workouts': {
      const stats = await prisma.userWorkoutStats.findUnique({ where: { userId } });
      return stats?.totalWorkouts ?? 0;
    }
    case 'current_streak': {
      const stats = await prisma.userWorkoutStats.findUnique({ where: { userId } });
      return stats?.currentStreak ?? 0;
    }
    case 'longest_streak': {
      const stats = await prisma.userWorkoutStats.findUnique({ where: { userId } });
      return stats?.longestStreak ?? 0;
    }
    case 'ugc_posts': {
      return prisma.ugcPost.count({
        where: { userId, status: 'approved', deletedAt: null },
      });
    }
    case 'programs_completed': {
      return prisma.userProgramProgress.count({
        where: { userId, status: 'completed' },
      });
    }
    case 'total_minutes': {
      const stats = await prisma.userWorkoutStats.findUnique({ where: { userId } });
      return stats?.totalMinutes ?? 0;
    }
    case 'focus_areas_covered': {
      const logs = await prisma.workoutLog.findMany({
        where: { userId },
        select: { focusAreas: true },
      });
      const uniqueAreas = new Set(logs.flatMap((l) => l.focusAreas));
      return uniqueAreas.size;
    }
    case 'studios_visited': {
      const studios = await prisma.workoutLog.findMany({
        where: { userId, studioId: { not: null } },
        select: { studioId: true },
        distinct: ['studioId'],
      });
      return studios.length;
    }
    default:
      return 0;
  }
}

/**
 * Check and award any new achievements for a user.
 * Returns the list of newly earned achievements.
 *
 * Call this after events like: workout logged, post approved, program completed.
 */
export async function checkAndAwardAchievements(
  userId: string
): Promise<Array<{ slug: string; name: string; description: string }>> {
  try {
    // Get all active achievements the user hasn't earned yet
    const unearned = await prisma.achievement.findMany({
      where: {
        isActive: true,
        userAchievements: {
          none: { userId },
        },
      },
    });

    if (unearned.length === 0) return [];

    // Group by metric to minimize DB queries
    const metricGroups = new Map<string, typeof unearned>();
    for (const achievement of unearned) {
      const group = metricGroups.get(achievement.metric) || [];
      group.push(achievement);
      metricGroups.set(achievement.metric, group);
    }

    const newlyEarned: Array<{ slug: string; name: string; description: string }> = [];

    for (const [metric, achievements] of metricGroups) {
      const value = await getMetricValue(userId, metric);

      for (const achievement of achievements) {
        if (value >= achievement.threshold) {
          // Award the achievement
          await prisma.userAchievement.create({
            data: { userId, achievementId: achievement.id },
          });

          // Create in-app notification
          await prisma.inAppNotification.create({
            data: {
              userId,
              type: 'achievement',
              title: `Achievement Unlocked: ${achievement.name}`,
              body: achievement.description,
              data: { achievementId: achievement.id, slug: achievement.slug },
            },
          });

          newlyEarned.push({
            slug: achievement.slug,
            name: achievement.name,
            description: achievement.description,
          });
        }
      }
    }

    if (newlyEarned.length > 0) {
      logger.info('achievements', `Awarded ${newlyEarned.length} achievements to user ${userId}`, {
        achievements: newlyEarned.map((a) => a.slug),
      });
    }

    return newlyEarned;
  } catch (error) {
    // Fire-and-forget: achievement check failures should never break the main flow
    logger.error('achievements', 'Failed to check achievements', error);
    return [];
  }
}
