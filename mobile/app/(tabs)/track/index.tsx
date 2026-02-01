import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Pressable, Image } from 'react-native';
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
import { Skeleton, StatsSkeleton, WorkoutCardSkeleton } from '@/components/ui';
import Svg, { Path } from 'react-native-svg';

const logo = require('@/../../assets/images/logo.png');

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
        <ScrollView style={styles.scroll} contentContainerStyle={styles.teaserContent} showsVerticalScrollIndicator={false}>
          <Image source={logo} style={styles.logo} resizeMode="contain" />
          <Text style={styles.heroTitle}>Track Your Pilates Journey</Text>
          <Text style={styles.heroSubtitle}>
            Log your workouts in seconds, build streaks, and see your progress over time.
          </Text>

          {/* Demo Stats Preview */}
          <View style={styles.demoStatsRow}>
            <View style={styles.demoStat}>
              <Text style={styles.demoStatValue}>14</Text>
              <Text style={styles.demoStatLabel}>Day Streak</Text>
            </View>
            <View style={styles.demoStat}>
              <Text style={styles.demoStatValue}>3h 45m</Text>
              <Text style={styles.demoStatLabel}>This Week</Text>
            </View>
            <View style={styles.demoStat}>
              <Text style={styles.demoStatValue}>47</Text>
              <Text style={styles.demoStatLabel}>Workouts</Text>
            </View>
          </View>

          {/* Feature Cards */}
          <View style={styles.featureCard}>
            <Text style={styles.featureIcon}>&#9889;</Text>
            <View style={styles.featureTextWrap}>
              <Text style={styles.featureTitle}>Quick Logging</Text>
              <Text style={styles.featureDesc}>Log your workout in under 20 seconds. Just tap duration, type, and intensity.</Text>
            </View>
          </View>
          <View style={styles.featureCard}>
            <Text style={styles.featureIcon}>&#128293;</Text>
            <View style={styles.featureTextWrap}>
              <Text style={styles.featureTitle}>Build Your Streak</Text>
              <Text style={styles.featureDesc}>Stay consistent with streak tracking. Miss a day? You have a 24-hour grace period.</Text>
            </View>
          </View>
          <View style={styles.featureCard}>
            <Text style={styles.featureIcon}>&#128228;</Text>
            <View style={styles.featureTextWrap}>
              <Text style={styles.featureTitle}>Share Your Wins</Text>
              <Text style={styles.featureDesc}>Create beautiful recap cards to share on Instagram, WhatsApp, or the Tribe community.</Text>
            </View>
          </View>

          <Pressable style={styles.loginButton} onPress={() => router.push('/auth/login')}>
            <Text style={styles.loginButtonText}>Sign In to Start Tracking</Text>
            <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={colors.button.primaryText} strokeWidth={2.5}>
              <Path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </Pressable>
          <Text style={styles.freeText}>Free with your Pilareta account</Text>
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
          <RefreshControl refreshing={isRefetching} onRefresh={onRefresh} tintColor={colors.fg.primary} />
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
          <Pressable onPress={() => router.push('/settings')} style={styles.settingsButton} accessibilityRole="button" accessibilityLabel="Settings">
            <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={colors.fg.secondary} strokeWidth={1.5}>
              <Path d="M12 15a3 3 0 100-6 3 3 0 000 6z" strokeLinecap="round" strokeLinejoin="round" />
              <Path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </Pressable>
        </View>

        {/* Streak */}
        {isLoading && !stats ? (
          <View style={styles.section}><Skeleton width="100%" height={100} borderRadius={12} /></View>
        ) : stats ? (
          <View style={styles.section}>
            <StreakDisplay currentStreak={stats.currentStreak} longestStreak={stats.longestStreak} lastWorkoutDate={stats.lastWorkoutDate} />
          </View>
        ) : null}

        {/* Weekly Progress */}
        {isLoading && !weeklyProgress.length ? (
          <View style={styles.section}><Skeleton width="100%" height={80} borderRadius={12} /></View>
        ) : (
          <View style={styles.section}><WeeklyProgress progress={weeklyProgress} /></View>
        )}

        {/* Stats */}
        {isLoading && !stats ? (
          <View style={styles.section}><StatsSkeleton /></View>
        ) : stats ? (
          <View style={styles.section}>
            <StatsOverview totalWorkouts={stats.totalWorkouts} totalMinutes={stats.totalMinutes} weeklyMinutes={stats.weeklyMinutes} monthlyMinutes={stats.monthlyMinutes} totalCalories={stats.totalCalories} averageRpe={stats.averageRpe} />
          </View>
        ) : null}

        {/* Recent Logs */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Workouts</Text>
          <RecentLogs />
        </View>
      </ScrollView>

      {/* FAB */}
      <Pressable style={styles.fab} onPress={() => router.push('/(tabs)/track/log')} accessibilityRole="button" accessibilityLabel="Log a new workout">
        <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={colors.bg.primary} strokeWidth={2.5}>
          <Path d="M12 5v14M5 12h14" strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.primary },
  scroll: { flex: 1 },
  content: { padding: spacing.md, paddingBottom: 100 },
  teaserContent: { padding: spacing.lg, paddingBottom: 60, alignItems: 'center' },
  logo: { width: 180, height: 64, marginBottom: spacing.lg, marginTop: spacing.md },
  heroTitle: { fontSize: typography.sizes['2xl'], fontWeight: typography.weights.bold, color: colors.fg.primary, textAlign: 'center', marginBottom: spacing.sm },
  heroSubtitle: { fontSize: typography.sizes.base, color: colors.fg.secondary, textAlign: 'center', lineHeight: 22, marginBottom: spacing.xl, paddingHorizontal: spacing.md },
  demoStatsRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.xl, width: '100%' },
  demoStat: { flex: 1, backgroundColor: colors.bg.card, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border.default, padding: spacing.md, alignItems: 'center', opacity: 0.7 },
  demoStatValue: { fontSize: typography.sizes.xl, fontWeight: typography.weights.bold, color: colors.fg.primary, marginBottom: 2 },
  demoStatLabel: { fontSize: typography.sizes.xs, color: colors.fg.tertiary },
  featureCard: { flexDirection: 'row', backgroundColor: colors.bg.card, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border.default, padding: spacing.md, marginBottom: spacing.sm, width: '100%', gap: spacing.sm, alignItems: 'flex-start' },
  featureIcon: { fontSize: 20, marginTop: 2 },
  featureTextWrap: { flex: 1 },
  featureTitle: { fontSize: typography.sizes.sm, fontWeight: typography.weights.semibold, color: colors.fg.primary, marginBottom: 2 },
  featureDesc: { fontSize: typography.sizes.xs, color: colors.fg.tertiary, lineHeight: 18 },
  loginButton: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.button.primaryBg, borderRadius: radius.md, paddingVertical: 16, paddingHorizontal: 32, marginTop: spacing.lg },
  loginButtonText: { fontSize: typography.sizes.md, fontWeight: typography.weights.semibold, color: colors.button.primaryText },
  freeText: { fontSize: typography.sizes.xs, color: colors.fg.muted, marginTop: spacing.sm },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.lg },
  greeting: { fontSize: typography.sizes.xl, fontWeight: typography.weights.bold, color: colors.fg.primary, marginBottom: 2 },
  headerSubtitle: { fontSize: typography.sizes.sm, color: colors.fg.tertiary },
  settingsButton: { padding: spacing.sm },
  section: { marginBottom: spacing.md },
  sectionTitle: { fontSize: typography.sizes.base, fontWeight: typography.weights.semibold, color: colors.fg.primary, marginBottom: spacing.sm },
  fab: { position: 'absolute', right: spacing.md, bottom: spacing.md, width: 56, height: 56, borderRadius: 28, backgroundColor: colors.button.primaryBg, alignItems: 'center', justifyContent: 'center', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4 },
});
