import { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Card } from '@/components/ui';
import { colors, typography, spacing, radius } from '@/theme';
import { GoalSettingModal } from './GoalSettingModal';

interface GoalCardProps {
  weeklyWorkoutGoal: number | null;
  weeklyMinuteGoal: number | null;
  currentWorkouts: number;
  currentMinutes: number;
  onGoalsSaved: () => void;
}

function ProgressRing({
  current,
  goal,
  size = 68,
  strokeWidth = 5,
  color,
}: {
  current: number;
  goal: number;
  size?: number;
  strokeWidth?: number;
  color: string;
}) {
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;
  const progress = Math.min(current / goal, 1);
  const strokeDashoffset = circumference * (1 - progress);
  const center = size / 2;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        <Circle
          cx={center}
          cy={center}
          r={r}
          stroke={colors.cream10}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={center}
          cy={center}
          r={r}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          rotation="-90"
          origin={`${center}, ${center}`}
        />
      </Svg>
      <Text style={styles.ringValue}>{current}</Text>
    </View>
  );
}

export function GoalCard({
  weeklyWorkoutGoal,
  weeklyMinuteGoal,
  currentWorkouts,
  currentMinutes,
  onGoalsSaved,
}: GoalCardProps) {
  const [modalVisible, setModalVisible] = useState(false);

  const hasGoals = weeklyWorkoutGoal != null || weeklyMinuteGoal != null;

  if (!hasGoals) {
    return (
      <>
        <Pressable onPress={() => setModalVisible(true)}>
          <Card padding="md">
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>Set Weekly Goals</Text>
              <Text style={styles.emptySubtitle}>
                Track your workout consistency with personalized weekly targets
              </Text>
              <View style={styles.setGoalsButton}>
                <Text style={styles.setGoalsButtonText}>Set Goals</Text>
              </View>
            </View>
          </Card>
        </Pressable>
        <GoalSettingModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          currentWorkoutGoal={weeklyWorkoutGoal}
          currentMinuteGoal={weeklyMinuteGoal}
          onSaved={onGoalsSaved}
        />
      </>
    );
  }

  const workoutColor = weeklyWorkoutGoal
    ? currentWorkouts >= weeklyWorkoutGoal
      ? colors.success
      : colors.accent.amber
    : colors.success;

  const minuteColor = weeklyMinuteGoal
    ? currentMinutes >= weeklyMinuteGoal
      ? colors.success
      : colors.accent.amber
    : colors.success;

  return (
    <>
      <Pressable onPress={() => setModalVisible(true)}>
        <Card padding="md">
          <View style={styles.header}>
            <Text style={styles.title}>Weekly Goals</Text>
            <Text style={styles.editText}>Edit</Text>
          </View>

          <View style={styles.goalsRow}>
            {weeklyWorkoutGoal != null && (
              <View style={styles.goalItem}>
                <ProgressRing
                  current={currentWorkouts}
                  goal={weeklyWorkoutGoal}
                  color={workoutColor}
                />
                <Text style={styles.goalLabel}>
                  {currentWorkouts}/{weeklyWorkoutGoal} workouts
                </Text>
              </View>
            )}

            {weeklyMinuteGoal != null && (
              <View style={styles.goalItem}>
                <ProgressRing
                  current={currentMinutes}
                  goal={weeklyMinuteGoal}
                  color={minuteColor}
                />
                <Text style={styles.goalLabel}>
                  {currentMinutes}/{weeklyMinuteGoal} min
                </Text>
              </View>
            )}
          </View>
        </Card>
      </Pressable>
      <GoalSettingModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        currentWorkoutGoal={weeklyWorkoutGoal}
        currentMinuteGoal={weeklyMinuteGoal}
        onSaved={onGoalsSaved}
      />
    </>
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
  editText: {
    fontSize: typography.sizes.sm,
    color: colors.fg.tertiary,
  },
  goalsRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
  goalItem: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  ringValue: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.fg.primary,
  },
  goalLabel: {
    fontSize: typography.sizes.xs,
    color: colors.fg.tertiary,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  emptyTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.medium,
    color: colors.fg.primary,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: typography.sizes.sm,
    color: colors.fg.tertiary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  setGoalsButton: {
    backgroundColor: colors.cream10,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.sm,
  },
  setGoalsButtonText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.fg.primary,
  },
});
