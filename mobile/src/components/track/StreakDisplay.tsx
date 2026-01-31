import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Card } from '@/components/ui';
import { colors, typography, spacing, radius } from '@/theme';

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
  return (
    <View>
      <View style={styles.topRow}>
        <Text style={styles.emoji}>{isActive ? '\u{1F525}' : '\u{2744}\u{FE0F}'}</Text>
        <View>
          <Text style={styles.streakCount}>{currentStreak}</Text>
          <Text style={styles.streakLabel}>day streak</Text>
        </View>
      </View>

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
