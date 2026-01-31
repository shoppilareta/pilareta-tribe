import { View, Text, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Card, Badge } from '@/components/ui';
import { colors, typography, spacing, radius } from '@/theme';
import type { Exercise } from '@shared/types';

interface ExerciseCardProps {
  exercise: Exercise;
}

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: 'rgba(34, 197, 94, 0.3)',
  intermediate: 'rgba(234, 179, 8, 0.3)',
  advanced: 'rgba(239, 68, 68, 0.3)',
};

export function ExerciseCard({ exercise }: ExerciseCardProps) {
  return (
    <Pressable onPress={() => router.push(`/(tabs)/learn/exercises/${exercise.slug}`)}>
      <Card padding="md" style={styles.card}>
        <View style={styles.topRow}>
          <View style={[styles.difficultyBadge, { backgroundColor: DIFFICULTY_COLORS[exercise.difficulty] || colors.cream10 }]}>
            <Text style={styles.difficultyText}>{exercise.difficulty}</Text>
          </View>
          <Text style={styles.rpe}>RPE {exercise.rpeTarget}</Text>
        </View>

        <Text style={styles.name} numberOfLines={1}>{exercise.name}</Text>
        <Text style={styles.description} numberOfLines={2}>{exercise.description}</Text>

        {exercise.focusAreas.length > 0 && (
          <View style={styles.focusRow}>
            {exercise.focusAreas.slice(0, 3).map((area) => (
              <View key={area} style={styles.focusChip}>
                <Text style={styles.focusChipText}>{area}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.infoRow}>
          {exercise.equipment && (
            <Text style={styles.infoText}>{exercise.equipment}</Text>
          )}
          {exercise.defaultSets > 0 && (
            <Text style={styles.infoText}>
              {exercise.defaultSets} sets
              {exercise.defaultReps ? ` x ${exercise.defaultReps}` : ''}
              {exercise.defaultDuration ? ` x ${exercise.defaultDuration}s` : ''}
            </Text>
          )}
        </View>
      </Card>
    </Pressable>
  );
}

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
  difficultyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: radius.xs,
  },
  difficultyText: {
    fontSize: 11,
    color: colors.fg.primary,
    textTransform: 'capitalize',
    fontWeight: typography.weights.medium,
  },
  rpe: {
    fontSize: typography.sizes.xs,
    color: colors.fg.tertiary,
  },
  name: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.fg.primary,
    marginBottom: 4,
  },
  description: {
    fontSize: typography.sizes.sm,
    color: colors.fg.tertiary,
    lineHeight: 18,
    marginBottom: spacing.sm,
  },
  focusRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.sm,
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
  infoRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  infoText: {
    fontSize: typography.sizes.xs,
    color: colors.fg.muted,
    textTransform: 'capitalize',
  },
});
