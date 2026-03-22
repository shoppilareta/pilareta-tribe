import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Card } from '@/components/ui';
import { colors, typography, spacing, radius } from '@/theme';

const STREAK_MILESTONES = [7, 14, 30, 60, 100];

interface StreakDisplayProps {
  currentStreak: number;
  longestStreak: number;
  lastWorkoutDate: string | null;
}

function formatLastWorkout(dateStr: string | null): string {
  if (!dateStr) return 'Never';

  const date = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const logDate = new Date(date);
  logDate.setHours(0, 0, 0, 0);

  if (logDate.getTime() === today.getTime()) return 'Today';
  if (logDate.getTime() === yesterday.getTime()) return 'Yesterday';

  const diffDays = Math.floor((today.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 7) return `${diffDays} days ago`;

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function isLastWorkoutYesterday(dateStr: string | null): boolean {
  if (!dateStr) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const logDate = new Date(dateStr);
  logDate.setHours(0, 0, 0, 0);
  return logDate.getTime() === yesterday.getTime();
}

function getNextMilestone(currentStreak: number): { target: number; daysLeft: number } | null {
  for (const m of STREAK_MILESTONES) {
    if (currentStreak < m) {
      return { target: m, daysLeft: m - currentStreak };
    }
  }
  return null;
}

export function StreakDisplay({ currentStreak, longestStreak, lastWorkoutDate }: StreakDisplayProps) {
  const isActive = currentStreak > 0;
  const isPersonalBest = currentStreak > 0 && currentStreak >= longestStreak;

  if (isActive) {
    return (
      <LinearGradient
        colors={['rgba(249, 115, 22, 0.15)', 'rgba(239, 68, 68, 0.1)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.container, styles.activeContainer]}
      >
        <StreakContent
          currentStreak={currentStreak}
          longestStreak={longestStreak}
          lastWorkoutDate={lastWorkoutDate}
          isActive={isActive}
          isPersonalBest={isPersonalBest}
        />
      </LinearGradient>
    );
  }

  return (
    <Card padding="md">
      <StreakContent
        currentStreak={currentStreak}
        longestStreak={longestStreak}
        lastWorkoutDate={lastWorkoutDate}
        isActive={isActive}
        isPersonalBest={isPersonalBest}
      />
    </Card>
  );
}

function StreakContent({
  currentStreak,
  longestStreak,
  lastWorkoutDate,
  isActive,
  isPersonalBest,
}: StreakDisplayProps & { isActive: boolean; isPersonalBest: boolean }) {
  const showGracePeriod = currentStreak > 0 && isLastWorkoutYesterday(lastWorkoutDate);
  const nextMilestone = getNextMilestone(currentStreak);

  return (
    <View>
      <View style={styles.topRow}>
        <Text style={styles.emoji}>{isActive ? '\u{1F525}' : '\u{2744}\u{FE0F}'}</Text>
        <View>
          <Text style={styles.streakCount}>{currentStreak}</Text>
          <Text style={styles.streakLabel}>day streak</Text>
        </View>
      </View>

      {/* Grace period warning */}
      {showGracePeriod && (
        <View style={styles.gracePeriod}>
          <Text style={styles.gracePeriodText}>Log today to keep your streak!</Text>
        </View>
      )}

      <View style={styles.bottomRow}>
        <Text style={styles.metaText}>
          <Text style={styles.metaLabel}>Longest: </Text>
          <Text style={styles.metaValue}>{longestStreak} days</Text>
        </Text>
        <Text style={styles.metaText}>
          <Text style={styles.metaLabel}>Last: </Text>
          <Text style={styles.metaValue}>{formatLastWorkout(lastWorkoutDate)}</Text>
        </Text>
      </View>

      {/* Milestone badges */}
      {isActive && (
        <View style={styles.milestoneRow}>
          {STREAK_MILESTONES.map((m) => {
            const reached = currentStreak >= m;
            return (
              <View
                key={m}
                style={[styles.milestoneBadge, reached && styles.milestoneBadgeReached]}
              >
                <Text style={[styles.milestoneBadgeText, reached && styles.milestoneBadgeTextReached]}>
                  {m}
                </Text>
              </View>
            );
          })}
        </View>
      )}

      {/* Next milestone hint */}
      {isActive && nextMilestone && (
        <Text style={styles.milestoneHint}>
          {nextMilestone.daysLeft} more day{nextMilestone.daysLeft !== 1 ? 's' : ''} to {nextMilestone.target}-day milestone!
        </Text>
      )}

      {isPersonalBest && (
        <View style={styles.personalBest}>
          <Text style={styles.personalBestText}>{'\u2B50'} Personal best!</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: radius.md,
    padding: spacing.md,
  },
  activeContainer: {
    borderWidth: 1,
    borderColor: 'rgba(249, 115, 22, 0.3)',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  emoji: {
    fontSize: 40,
    lineHeight: 48,
  },
  streakCount: {
    fontSize: 32,
    fontWeight: typography.weights.semibold,
    color: colors.fg.primary,
    lineHeight: 38,
  },
  streakLabel: {
    fontSize: typography.sizes.sm,
    color: colors.fg.tertiary,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaText: {
    fontSize: typography.sizes.sm,
  },
  metaLabel: {
    color: colors.fg.tertiary,
  },
  metaValue: {
    color: colors.fg.primary,
    fontWeight: typography.weights.medium,
  },
  gracePeriod: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    borderRadius: radius.sm,
    padding: spacing.sm,
    marginBottom: spacing.sm,
    alignItems: 'center',
  },
  gracePeriodText: {
    fontSize: typography.sizes.sm,
    color: colors.accent.amber,
    fontWeight: typography.weights.medium,
  },
  milestoneRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  milestoneBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.cream10,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  milestoneBadgeReached: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    borderColor: colors.accent.amber,
  },
  milestoneBadgeText: {
    fontSize: 10,
    fontWeight: typography.weights.medium,
    color: colors.fg.muted,
  },
  milestoneBadgeTextReached: {
    color: colors.accent.amber,
    fontWeight: typography.weights.bold,
  },
  milestoneHint: {
    fontSize: typography.sizes.xs,
    color: colors.fg.tertiary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  personalBest: {
    marginTop: spacing.sm,
    padding: spacing.sm,
    backgroundColor: colors.cream10,
    borderRadius: radius.sm,
    alignItems: 'center',
  },
  personalBestText: {
    fontSize: typography.sizes.sm,
    color: colors.fg.primary,
  },
});
