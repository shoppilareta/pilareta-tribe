import { View, Text, StyleSheet } from 'react-native';
import { Card } from '@/components/ui';
import { colors, typography, spacing, radius } from '@/theme';
import Svg, { Path } from 'react-native-svg';

interface StatsOverviewProps {
  totalWorkouts: number;
  totalMinutes: number;
  weeklyMinutes: number;
  monthlyMinutes: number;
  totalCalories: number;
  averageRpe: number | null;
  monthlyWorkouts?: number;
}

function formatMinutes(mins: number): string {
  if (mins < 60) return `${mins} min`;
  const hours = Math.floor(mins / 60);
  const remainingMins = mins % 60;
  if (remainingMins === 0) return `${hours}h`;
  return `${hours}h ${remainingMins}m`;
}

function StatIcon({ type }: { type: 'week' | 'month' | 'total' | 'time' }) {
  const iconColor = colors.fg.secondary;
  switch (type) {
    case 'week':
      return (
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth={1.5}>
          <Path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      );
    case 'month':
      return (
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth={1.5}>
          <Path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      );
    case 'total':
      return (
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth={1.5}>
          <Path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      );
    case 'time':
      return (
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth={1.5}>
          <Path d="M13 10V3L4 14h7v7l9-11h-7z" strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      );
  }
}

export function StatsOverview({
  totalWorkouts,
  totalMinutes,
  weeklyMinutes,
  monthlyMinutes,
  totalCalories,
  averageRpe,
  monthlyWorkouts,
}: StatsOverviewProps) {
  // Calculate consistency: (workouts this month / days elapsed) * 100, capped at 100
  const now = new Date();
  const daysElapsed = now.getDate(); // 1-based day of month = days elapsed
  const consistencyRaw = monthlyWorkouts != null && daysElapsed > 0
    ? (monthlyWorkouts / daysElapsed) * 100
    : null;
  const consistency = consistencyRaw != null ? Math.min(Math.round(consistencyRaw), 100) : null;

  const stats = [
    { label: 'This Week', value: formatMinutes(weeklyMinutes), type: 'week' as const },
    { label: 'This Month', value: formatMinutes(monthlyMinutes), type: 'month' as const },
    { label: 'Total Workouts', value: String(totalWorkouts), type: 'total' as const },
    { label: 'Total Time', value: formatMinutes(totalMinutes), type: 'time' as const },
  ];

  return (
    <View>
      <View style={styles.grid}>
        {stats.map((stat) => (
          <Card key={stat.label} padding="md" style={styles.statCard}>
            <View style={styles.iconContainer}>
              <StatIcon type={stat.type} />
            </View>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </Card>
        ))}
      </View>

      <View style={styles.secondaryRow}>
        <Text style={styles.secondaryText}>
          <Text style={styles.secondaryLabel}>Est. Calories: </Text>
          <Text style={styles.secondaryValue}>{totalCalories.toLocaleString()}</Text>
        </Text>
        {averageRpe !== null && (
          <Text style={styles.secondaryText}>
            <Text style={styles.secondaryLabel}>Avg. Intensity: </Text>
            <Text style={styles.secondaryValue}>{averageRpe}/10</Text>
          </Text>
        )}
      </View>

      {consistency != null && (
        <View style={styles.consistencyContainer}>
          <View style={styles.consistencyHeader}>
            <Text style={styles.consistencyLabel}>Consistency</Text>
            <Text style={styles.consistencyValue}>{consistency}%</Text>
          </View>
          <View style={styles.consistencyBarBg}>
            <View
              style={[
                styles.consistencyBarFill,
                {
                  width: `${consistency}%`,
                  backgroundColor: consistency >= 70 ? 'rgba(34, 197, 94, 0.8)' : consistency >= 40 ? 'rgba(245, 158, 11, 0.8)' : 'rgba(239, 68, 68, 0.6)',
                },
              ]}
            />
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.cream10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
    opacity: 0.8,
  },
  statValue: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.semibold,
    color: colors.fg.primary,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: typography.sizes.xs,
    color: colors.fg.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  secondaryRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 32,
    marginTop: spacing.md,
  },
  secondaryText: {
    textAlign: 'center',
  },
  secondaryLabel: {
    color: colors.fg.tertiary,
    fontSize: typography.sizes.sm,
  },
  secondaryValue: {
    color: colors.fg.primary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
  },
  consistencyContainer: {
    marginTop: spacing.md,
    backgroundColor: colors.bg.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border.default,
    padding: spacing.md,
  },
  consistencyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  consistencyLabel: {
    fontSize: typography.sizes.sm,
    color: colors.fg.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  consistencyValue: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.fg.primary,
  },
  consistencyBarBg: {
    height: 6,
    backgroundColor: colors.cream10,
    borderRadius: 3,
    overflow: 'hidden',
  },
  consistencyBarFill: {
    height: '100%',
    borderRadius: 3,
  },
});
