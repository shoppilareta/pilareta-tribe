import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { colors, typography, spacing, radius } from '@/theme';
import { useAuthStore } from '@/stores/authStore';
import { getStats } from '@/api/track';
import { StatsOverview } from '@/components/track/StatsOverview';
import { StreakDisplay } from '@/components/track/StreakDisplay';
import { WeeklyProgress } from '@/components/track/WeeklyProgress';
import { RecentLogs } from '@/components/track/RecentLogs';
import Svg, { Path } from 'react-native-svg';

export default function TrackDashboard() {
  const { isAuthenticated, user } = useAuthStore();
  const [refreshKey, setRefreshKey] = useState(0);

  const { data, isLoading, isRefetching, refetch } = useQuery({
    queryKey: ['track-stats', refreshKey],
    queryFn: getStats,
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 2,
  });

  const onRefresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
    refetch();
  }, [refetch]);

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.centeredContent}>
          <Text style={styles.brand}>PILARETA TRIBE</Text>
          <Text style={styles.subtitle}>Track your Pilates journey</Text>
          <View style={styles.teaser}>
            <Text style={styles.teaserText}>
              Sign in to log workouts, build streaks, and track your progress.
            </Text>
          </View>
          <Pressable
            style={styles.loginButton}
            onPress={() => router.push('/auth/login')}
          >
            <Text style={styles.loginButtonText}>Sign In</Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    );
  }

  const stats = data?.stats;
  const weeklyProgress = data?.weeklyProgress || [];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={onRefresh}
            tintColor={colors.fg.primary}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>
              {user?.firstName ? `Hey, ${user.firstName}` : 'Track'}
            </Text>
            <Text style={styles.headerSubtitle}>Your Pilates journey at a glance</Text>
          </View>
          <Pressable onPress={() => router.push('/settings')} style={styles.settingsButton}>
            <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={colors.fg.secondary} strokeWidth={1.5}>
              <Path d="M12 15a3 3 0 100-6 3 3 0 000 6z" strokeLinecap="round" strokeLinejoin="round" />
              <Path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </Pressable>
        </View>

        {/* Streak */}
        {stats && (
          <View style={styles.section}>
            <StreakDisplay
              currentStreak={stats.currentStreak}
              longestStreak={stats.longestStreak}
              lastWorkoutDate={stats.lastWorkoutDate}
            />
          </View>
        )}

        {/* Weekly Progress */}
        <View style={styles.section}>
          <WeeklyProgress progress={weeklyProgress} />
        </View>

        {/* Stats */}
        {stats && (
          <View style={styles.section}>
            <StatsOverview
              totalWorkouts={stats.totalWorkouts}
              totalMinutes={stats.totalMinutes}
              weeklyMinutes={stats.weeklyMinutes}
              monthlyMinutes={stats.monthlyMinutes}
              totalCalories={stats.totalCalories}
              averageRpe={stats.averageRpe}
            />
          </View>
        )}

        {/* Recent Logs */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Workouts</Text>
          <RecentLogs />
        </View>
      </ScrollView>

      {/* FAB - Log Workout */}
      <Pressable
        style={styles.fab}
        onPress={() => router.push('/(tabs)/track/log')}
      >
        <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={colors.bg.primary} strokeWidth={2.5}>
          <Path d="M12 5v14M5 12h14" strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg.primary,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
    paddingBottom: 100,
  },
  centeredContent: {
    flex: 1,
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brand: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    color: colors.fg.primary,
    letterSpacing: 3,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.sizes.md,
    color: colors.fg.secondary,
    marginBottom: spacing.xl,
  },
  teaser: {
    backgroundColor: colors.bg.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border.default,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  teaserText: {
    color: colors.fg.secondary,
    fontSize: typography.sizes.base,
    textAlign: 'center',
    lineHeight: 22,
  },
  loginButton: {
    backgroundColor: colors.button.primaryBg,
    borderRadius: radius.md,
    paddingVertical: 16,
    paddingHorizontal: 48,
  },
  loginButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.button.primaryText,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  greeting: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.fg.primary,
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: typography.sizes.sm,
    color: colors.fg.tertiary,
  },
  settingsButton: {
    padding: spacing.sm,
  },
  section: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.fg.primary,
    marginBottom: spacing.sm,
  },
  fab: {
    position: 'absolute',
    right: spacing.md,
    bottom: spacing.md,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.button.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});
