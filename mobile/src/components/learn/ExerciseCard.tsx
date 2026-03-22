import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { router } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
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

        {exercise.imageUrl && (
          <View style={styles.imageContainer}>
            <Image source={{ uri: exercise.imageUrl }} style={styles.cardImage} resizeMode="cover" />
            {exercise.videoUrl && (
              <View style={styles.playOverlay}>
                <View style={styles.playCircle}>
                  <Svg width={24} height={24} viewBox="0 0 24 24" fill="white">
                    <Path d="M8 5v14l11-7z" />
                  </Svg>
                </View>
              </View>
            )}
          </View>
        )}

        <Text style={styles.name} numberOfLines={2}>{exercise.name}</Text>
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
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  difficultyText: {
    fontSize: typography.sizes.xs,
    color: colors.fg.primary,
    textTransform: 'uppercase',
    fontWeight: typography.weights.semibold,
    letterSpacing: 0.5,
  },
  rpe: {
    fontSize: typography.sizes.xs,
    color: colors.fg.tertiary,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: radius.sm,
    overflow: 'hidden',
    marginBottom: spacing.sm,
    backgroundColor: colors.cream10,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  playOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.fg.primary,
    marginBottom: 4,
    lineHeight: 22,
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
