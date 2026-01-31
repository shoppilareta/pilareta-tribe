import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Card } from '@/components/ui';
import { colors, typography, spacing, radius } from '@/theme';
import Svg, { Path } from 'react-native-svg';

interface WeeklyProgressProps {
  progress: boolean[];
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function WeeklyProgress({ progress }: WeeklyProgressProps) {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const todayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const workoutsThisWeek = progress.filter(Boolean).length;
  const progressPercent = (workoutsThisWeek / 7) * 100;

  return (
    <Card padding="md">
      <View style={styles.header}>
        <Text style={styles.title}>This Week</Text>
        <Text style={styles.count}>{workoutsThisWeek}/7 days</Text>
      </View>

      <View style={styles.daysRow}>
        {DAYS.map((day, index) => {
          const hasWorkout = progress[index];
          const isToday = index === todayIndex;
          const isFuture = index > todayIndex;

          return (
            <View key={day} style={styles.dayColumn}>
              <View
                style={[
                  styles.dayCircle,
                  hasWorkout && styles.dayCircleActive,
                  isFuture && !hasWorkout && styles.dayCircleFuture,
                  isToday && styles.dayCircleToday,
                ]}
              >
                {hasWorkout && (
                  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.5}>
                    <Path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                  </Svg>
                )}
              </View>
              <Text
                style={[
                  styles.dayLabel,
                  isToday && styles.dayLabelToday,
                ]}
              >
                {day}
              </Text>
            </View>
          );
        })}
      </View>

      {/* Progress bar */}
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBarBg}>
          <LinearGradient
            colors={['rgba(34, 197, 94, 0.8)', 'rgba(22, 163, 74, 0.8)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.progressBarFill, { width: `${progressPercent}%` }]}
          />
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.medium,
    color: colors.fg.primary,
  },
  count: {
    fontSize: typography.sizes.sm,
    color: colors.fg.tertiary,
  },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 4,
  },
  dayColumn: {
    flex: 1,
    alignItems: 'center',
  },
  dayCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.cream10,
    marginBottom: 6,
  },
  dayCircleActive: {
    backgroundColor: 'rgba(34, 197, 94, 0.8)',
  },
  dayCircleFuture: {
    backgroundColor: colors.cream05,
  },
  dayCircleToday: {
    borderWidth: 2,
    borderColor: 'rgba(246, 237, 221, 0.5)',
  },
  dayLabel: {
    fontSize: 11,
    color: colors.fg.tertiary,
  },
  dayLabelToday: {
    color: colors.fg.primary,
    fontWeight: typography.weights.medium,
  },
  progressBarContainer: {
    marginTop: spacing.md,
  },
  progressBarBg: {
    height: 4,
    backgroundColor: colors.cream10,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2,
  },
});
