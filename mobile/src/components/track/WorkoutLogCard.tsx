import { memo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import { Card } from '@/components/ui';
import { colors, typography, spacing, radius } from '@/theme';
import type { WorkoutLog } from '@shared/types';

interface WorkoutLogCardProps {
  log: WorkoutLog;
}

const WORKOUT_TYPE_LABELS: Record<string, string> = {
  reformer: 'Reformer',
  mat: 'Mat',
  tower: 'Tower',
  other: 'Other',
};

function formatLogDate(dateStr: string): string {
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
  if (diffDays < 7) return date.toLocaleDateString('en-US', { weekday: 'long' });

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatDuration(mins: number): string {
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  const remaining = mins % 60;
  if (remaining === 0) return `${hours}h`;
  return `${hours}h ${remaining}m`;
}

function getRpeColor(rpe: number): string {
  if (rpe <= 3) return 'rgba(34, 197, 94, 0.8)';
  if (rpe <= 6) return 'rgba(234, 179, 8, 0.8)';
  if (rpe <= 8) return 'rgba(249, 115, 22, 0.8)';
  return 'rgba(239, 68, 68, 0.8)';
}

export const WorkoutLogCard = memo(function WorkoutLogCard({ log }: WorkoutLogCardProps) {
  return (
    <Pressable
      onPress={() => router.push(`/(tabs)/track/${log.id}`)}
      accessibilityRole="button"
      accessibilityLabel={`${WORKOUT_TYPE_LABELS[log.workoutType] || log.workoutType} workout, ${formatDuration(log.durationMinutes)}, RPE ${log.rpe}, ${formatLogDate(log.workoutDate)}`}
      accessibilityHint="Opens workout details"
    >
      <Card padding="md" style={styles.card}>
        <View style={styles.topRow}>
          <View style={styles.typeContainer}>
            <View style={[styles.rpeDot, { backgroundColor: getRpeColor(log.rpe) }]} />
            <Text style={styles.type}>
              {WORKOUT_TYPE_LABELS[log.workoutType] || log.workoutType}
            </Text>
          </View>
          <Text style={styles.date}>{formatLogDate(log.workoutDate)}</Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={colors.fg.tertiary} strokeWidth={1.5}>
              <Path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
            <Text style={styles.statText}>{formatDuration(log.durationMinutes)}</Text>
          </View>
          <View style={styles.stat}>
            <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={colors.fg.tertiary} strokeWidth={1.5}>
              <Path d="M13 10V3L4 14h7v7l9-11h-7z" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
            <Text style={styles.statText}>RPE {log.rpe}</Text>
          </View>
          {log.calorieEstimate && (
            <View style={styles.stat}>
              <Text style={styles.statText}>{log.calorieEstimate} cal</Text>
            </View>
          )}
          {log.isShared && (
            <View style={styles.sharedBadge}>
              <Text style={styles.sharedText}>Shared</Text>
            </View>
          )}
        </View>

        {log.focusAreas.length > 0 && (
          <View style={styles.focusRow}>
            {log.focusAreas.slice(0, 3).map((area) => (
              <View key={area} style={styles.focusChip}>
                <Text style={styles.focusChipText}>{area}</Text>
              </View>
            ))}
            {log.focusAreas.length > 3 && (
              <Text style={styles.moreText}>+{log.focusAreas.length - 3}</Text>
            )}
          </View>
        )}

        {log.notes && (
          <Text style={styles.notes} numberOfLines={1}>
            {log.notes}
          </Text>
        )}
      </Card>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.sm,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  rpeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  type: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.fg.primary,
  },
  date: {
    fontSize: typography.sizes.sm,
    color: colors.fg.tertiary,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: typography.sizes.sm,
    color: colors.fg.secondary,
  },
  sharedBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.xs,
    backgroundColor: colors.cream10,
  },
  sharedText: {
    fontSize: 10,
    color: colors.fg.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  focusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  focusChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.xs,
    backgroundColor: colors.cream05,
  },
  focusChipText: {
    fontSize: 11,
    color: colors.fg.tertiary,
    textTransform: 'capitalize',
  },
  moreText: {
    fontSize: 11,
    color: colors.fg.muted,
  },
  notes: {
    fontSize: typography.sizes.sm,
    color: colors.fg.tertiary,
    fontStyle: 'italic',
  },
});
