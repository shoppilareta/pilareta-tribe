import { View, Text, StyleSheet } from 'react-native';
import { Card } from '@/components/ui';
import { colors, typography, spacing, radius } from '@/theme';

interface TrendChartProps {
  weeklyData: { label: string; minutes: number }[];
}

const MAX_BAR_HEIGHT = 100;

export function TrendChart({ weeklyData }: TrendChartProps) {
  if (!weeklyData || weeklyData.length === 0) {
    return (
      <Card padding="md">
        <Text style={styles.title}>Weekly Trend</Text>
        <Text style={styles.emptyText}>
          Not enough data yet. Keep logging workouts!
        </Text>
      </Card>
    );
  }

  const maxMinutes = Math.max(...weeklyData.map((d) => d.minutes), 1);
  const totalMinutes = weeklyData.reduce((sum, d) => sum + d.minutes, 0);
  const weeksWithData = weeklyData.filter((d) => d.minutes > 0).length;
  const avgMinutes = weeksWithData > 0 ? Math.round(totalMinutes / weeksWithData) : 0;

  return (
    <Card padding="md">
      <View style={styles.header}>
        <Text style={styles.title}>Weekly Trend</Text>
        <Text style={styles.subtitle}>
          {totalMinutes} min over {weeklyData.length} week{weeklyData.length !== 1 ? 's' : ''}
        </Text>
      </View>

      <View style={styles.chartContainer}>
        {weeklyData.map((week, index) => {
          const barHeight = Math.max(
            (week.minutes / maxMinutes) * MAX_BAR_HEIGHT,
            week.minutes > 0 ? 4 : 0
          );
          const isLatest = index === weeklyData.length - 1;

          return (
            <View key={index} style={styles.barColumn}>
              <Text style={styles.minutesLabel}>
                {week.minutes > 0 ? week.minutes : ''}
              </Text>
              <View style={styles.barWrapper}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: barHeight,
                      backgroundColor: week.minutes > 0
                        ? isLatest ? colors.accent.gold : colors.accent.amber
                        : colors.cream10,
                    },
                  ]}
                />
              </View>
              <Text style={styles.weekLabel}>{week.label}</Text>
            </View>
          );
        })}
      </View>

      {/* Average line */}
      {weeksWithData > 1 && (
        <Text style={styles.avgText}>Avg: {avgMinutes} min/week</Text>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.medium,
    color: colors.fg.primary,
  },
  subtitle: {
    fontSize: typography.sizes.xs,
    color: colors.fg.tertiary,
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    paddingTop: spacing.sm,
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  minutesLabel: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    color: colors.fg.tertiary,
    height: 16,
    textAlign: 'center',
  },
  barWrapper: {
    height: MAX_BAR_HEIGHT,
    justifyContent: 'flex-end',
    width: '100%',
    alignItems: 'center',
  },
  bar: {
    width: '50%',
    minWidth: 20,
    maxWidth: 40,
    borderRadius: radius.xs,
  },
  weekLabel: {
    fontSize: 10,
    color: colors.fg.tertiary,
    marginTop: 2,
  },
  emptyText: {
    fontSize: typography.sizes.sm,
    color: colors.fg.tertiary,
    fontStyle: 'italic',
    marginTop: spacing.sm,
  },
  avgText: {
    fontSize: typography.sizes.xs,
    color: colors.fg.muted,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
});
