import { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { colors, typography, spacing } from '@/theme';
import { QuickLogForm } from '@/components/track/QuickLogForm';
import { GoalCelebration } from '@/components/track/GoalCelebration';
import { getStats } from '@/api/track';

export default function LogWorkout() {
  const queryClient = useQueryClient();
  const [showCelebration, setShowCelebration] = useState(false);

  const handleComplete = async () => {
    queryClient.invalidateQueries({ queryKey: ['track-stats'] });
    queryClient.invalidateQueries({ queryKey: ['track-logs'] });

    // Check if daily calorie target was met
    try {
      const stats = await getStats();
      if (
        stats?.profile?.dailyCalorieTarget &&
        stats?.todayCalories >= stats.profile.dailyCalorieTarget
      ) {
        setShowCelebration(true);
        return; // Don't navigate back yet — celebration will dismiss
      }
    } catch {
      // Ignore errors checking target
    }

    router.back();
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Log Workout</Text>
      </View>
      <QuickLogForm onComplete={handleComplete} onCancel={handleCancel} />
      <GoalCelebration
        visible={showCelebration}
        onDismiss={() => {
          setShowCelebration(false);
          router.back();
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg.primary,
  },
  header: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  title: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.fg.primary,
  },
});
