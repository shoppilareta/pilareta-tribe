import { View, Text, StyleSheet } from 'react-native';
import { Card } from '@/components/ui';
import { colors, typography, spacing, radius } from '@/theme';

interface FocusAreaBreakdownProps {
  focusAreaCounts: Record<string, number> | null;
}

const AREA_LABELS: Record<string, string> = {
  core: 'Core',
  glutes: 'Glutes',
  legs: 'Legs',
  arms: 'Arms',
  back: 'Back',
  mobility: 'Mobility',
  posture: 'Posture',
  full_body: 'Full Body',
};

const BAR_COLORS = [
  'rgba(34, 197, 94, 0.8)',   // green
  'rgba(59, 130, 246, 0.8)',  // blue
  'rgba(245, 158, 11, 0.8)', // amber
  'rgba(168, 85, 247, 0.8)', // purple
  'rgba(236, 72, 153, 0.8)', // pink
];

export function FocusAreaBreakdown({ focusAreaCounts }: FocusAreaBreakdownProps) {
  if (!focusAreaCounts) return null;

  const entries = Object.entries(focusAreaCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  if (entries.length === 0) return null;

  const total = entries.reduce((sum, [, count]) => sum + count, 0);

  return (
    <Card padding="md">
      <Text style={styles.title}>Focus Areas</Text>

      <View style={styles.bars}>
        {entries.map(([area, count], index) => {
          const percent = total > 0 ? Math.round((count / total) * 100) : 0;
          const label = AREA_LABELS[area] || area.charAt(0).toUpperCase() + area.slice(1);
          const barColor = BAR_COLORS[index % BAR_COLORS.length];

          return (
            <View key={area} style={styles.barRow}>
              <Text style={styles.barLabel}>{label}</Text>
              <View style={styles.barTrack}>
                <View style={[styles.barFill, { width: `${percent}%`, backgroundColor: barColor }]} />
              </View>
              <Text style={styles.barPercent}>{percent}%</Text>
            </View>
          );
        })}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.medium,
    color: colors.fg.primary,
    marginBottom: spacing.md,
  },
  bars: {
    gap: spacing.sm,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  barLabel: {
    width: 70,
    fontSize: typography.sizes.sm,
    color: colors.fg.secondary,
  },
  barTrack: {
    flex: 1,
    height: 8,
    backgroundColor: colors.cream10,
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
  },
  barPercent: {
    width: 36,
    fontSize: typography.sizes.xs,
    color: colors.fg.tertiary,
    textAlign: 'right',
  },
});
