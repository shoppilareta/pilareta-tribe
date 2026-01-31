import { View, Text, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Card, Badge } from '@/components/ui';
import { colors, typography, spacing, radius } from '@/theme';
import type { Program } from '@shared/types';

interface ProgramCardProps {
  program: Program;
}

export function ProgramCard({ program }: ProgramCardProps) {
  const totalSessions = program.durationWeeks * program.sessionsPerWeek;

  return (
    <Pressable onPress={() => router.push(`/(tabs)/learn/programs/${program.slug}`)}>
      <Card padding="md" style={styles.card}>
        <View style={styles.topRow}>
          <Badge text={program.level} variant="default" />
          <Badge text={program.equipment} variant="accent" />
        </View>

        <Text style={styles.name}>{program.name}</Text>
        <Text style={styles.description} numberOfLines={2}>{program.description}</Text>

        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{program.durationWeeks}</Text>
            <Text style={styles.statLabel}>weeks</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{program.sessionsPerWeek}</Text>
            <Text style={styles.statLabel}>per week</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{totalSessions}</Text>
            <Text style={styles.statLabel}>sessions</Text>
          </View>
        </View>

        {program.focusAreas.length > 0 && (
          <View style={styles.focusRow}>
            {program.focusAreas.map((area) => (
              <View key={area} style={styles.focusChip}>
                <Text style={styles.focusChipText}>{area}</Text>
              </View>
            ))}
          </View>
        )}
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
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  name: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.fg.primary,
    marginBottom: 4,
  },
  description: {
    fontSize: typography.sizes.sm,
    color: colors.fg.tertiary,
    lineHeight: 18,
    marginBottom: spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginBottom: spacing.sm,
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.fg.primary,
  },
  statLabel: {
    fontSize: 11,
    color: colors.fg.tertiary,
  },
  focusRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
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
});
