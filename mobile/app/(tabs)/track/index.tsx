import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Pressable, Image } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { colors, typography, spacing, radius } from '@/theme';
import { useAuthStore } from '@/stores/authStore';
import { getStats } from '@/api/track';
import { StatsOverview } from '@/components/track/StatsOverview';
import { StreakDisplay } from '@/components/track/StreakDisplay';
import { WeeklyProgress } from '@/components/track/WeeklyProgress';
import { RecentLogs } from '@/components/track/RecentLogs';
import { MonthlyCalendar } from '@/components/track/MonthlyCalendar';
import { GoalCard } from '@/components/track/GoalCard';
import { FocusAreaBreakdown } from '@/components/track/FocusAreaBreakdown';
import { TrendChart } from '@/components/track/TrendChart';
import { PersonalRecords } from '@/components/track/PersonalRecords';
import { Skeleton } from '@/components/ui';
import Svg, { Path } from 'react-native-svg';

type ViewMode = 'dashboard' | 'calendar';

const logo = require('@/../../assets/images/logo.png');

export default function TrackDashboard() {
  const { isAuthenticated, user } = useAuthStore();
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');
  const insets = useSafeAreaInsets();

  const { data, isLoading, isRefetching, refetch } = useQuery({
    queryKey: ['track-stats'],
    queryFn: getStats,
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 2,
  });

  const onRefresh = useCallback(() => {
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
  const weeklyProgress = Array.isArray(data?.weeklyProgress) ? data.weeklyProgress : [];

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

        {/* View Mode Toggle */}
        <View style={styles.viewToggleRow}>
          <Pressable
            style={[styles.viewToggleButton, viewMode === 'dashboard' && styles.viewToggleActive]}
            onPress={() => setViewMode('dashboard')}
            accessibilityRole="button"
            accessibilityLabel="Dashboard view"
            accessibilityState={{ selected: viewMode === 'dashboard' }}
          >
            <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={viewMode === 'dashboard' ? colors.fg.primary : colors.fg.tertiary} strokeWidth={1.5}>
              <Path d="M4 5a1 1 0 011-1h4a1 1 0 011 1v5a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zm0 7a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1v-7zm-10 2a1 1 0 011-1h4a1 1 0 011 1v5a1 1 0 01-1 1H5a1 1 0 01-1-1v-5z" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
            <Text style={[styles.viewToggleText, viewMode === 'dashboard' && styles.viewToggleTextActive]}>
              Dashboard
            </Text>
          </Pressable>
          <Pressable
            style={[styles.viewToggleButton, viewMode === 'calendar' && styles.viewToggleActive]}
            onPress={() => setViewMode('calendar')}
            accessibilityRole="button"
            accessibilityLabel="Calendar view"
            accessibilityState={{ selected: viewMode === 'calendar' }}
          >
            <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={viewMode === 'calendar' ? colors.fg.primary : colors.fg.tertiary} strokeWidth={1.5}>
              <Path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
            <Text style={[styles.viewToggleText, viewMode === 'calendar' && styles.viewToggleTextActive]}>
              Calendar
            </Text>
          </Pressable>
        </View>

        {viewMode === 'dashboard' ? (
          <>
            {/* Streak */}
            {isLoading && !stats ? (
              <View style={styles.section}><Skeleton width="100%" height={100} borderRadius={12} /></View>
            ) : stats ? (
              <View style={styles.section}>
                <StreakDisplay currentStreak={stats.currentStreak ?? 0} longestStreak={stats.longestStreak ?? 0} lastWorkoutDate={stats.lastWorkoutDate ?? null} />
              </View>
            ) : null}

            {/* Goal Card */}
            {stats ? (
              <View style={styles.section}>
                <GoalCard
                  weeklyWorkoutGoal={stats.weeklyWorkoutGoal}
                  weeklyMinuteGoal={stats.weeklyMinuteGoal}
                  currentWorkouts={stats.weeklyWorkouts ?? weeklyProgress.filter(Boolean).length}
                  currentMinutes={stats.weeklyMinutes ?? 0}
                  onGoalsSaved={onRefresh}
                />
              </View>
            ) : null}

            {/* Weekly Progress */}
            {isLoading && !weeklyProgress.length ? (
              <View style={styles.section}><Skeleton width="100%" height={80} borderRadius={12} /></View>
            ) : (
              <View style={styles.section}>
                <WeeklyProgress progress={weeklyProgress} weeklyWorkoutGoal={stats?.weeklyWorkoutGoal} />
              </View>
            )}

            {/* Stats */}
            {isLoading && !stats ? (
              <View style={styles.section}>
                <StatsOverview
                  totalWorkouts={0}
                  totalMinutes={0}
                  weeklyMinutes={0}
                  monthlyMinutes={0}
                  totalCalories={0}
                  averageRpe={null}
                  isLoading
                />
              </View>
            ) : stats ? (
              <View style={styles.section}>
                <StatsOverview
                  totalWorkouts={stats.totalWorkouts ?? 0}
                  totalMinutes={stats.totalMinutes ?? 0}
                  weeklyMinutes={stats.weeklyMinutes ?? 0}
                  monthlyMinutes={stats.monthlyMinutes ?? 0}
                  totalCalories={stats.totalCalories ?? 0}
                  averageRpe={stats.averageRpe ?? null}
                  monthlyWorkouts={stats.monthlyWorkouts}
                />
              </View>
            ) : null}

            {/* Focus Area Breakdown */}
            {stats?.focusAreaCounts ? (
              <View style={styles.section}>
                <FocusAreaBreakdown focusAreaCounts={stats.focusAreaCounts as Record<string, number>} />
              </View>
            ) : null}

            {/* Weekly Trend */}
            {stats?.weeklyTrend && stats.weeklyTrend.length > 0 ? (
              <View style={styles.section}>
                <TrendChart weeklyData={stats.weeklyTrend} />
              </View>
            ) : null}

            {/* Personal Records */}
            {stats?.personalRecords ? (
              <View style={styles.section}>
                <PersonalRecords records={stats.personalRecords} currentStreak={stats.currentStreak} />
              </View>
            ) : null}

            {/* Recent Logs */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Recent Workouts</Text>
              <RecentLogs />
            </View>
          </>
        ) : (
          <View style={styles.section}>
            <MonthlyCalendar currentStreak={stats?.currentStreak ?? 0} />
          </View>
        )}
      </ScrollView>

      {/* FABs */}
      <Pressable style={[styles.fabSecondary, { bottom: insets.bottom + 80 + 60 }]} onPress={() => router.push('/(tabs)/track/live')} accessibilityRole="button" accessibilityLabel="Start live workout">
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={colors.fg.primary} strokeWidth={2}>
          <Path d="M5 3l14 9-14 9V3z" strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      </Pressable>
      <Pressable style={[styles.fab, { bottom: insets.bottom + 80 }]} onPress={() => router.push('/(tabs)/track/log')} accessibilityRole="button" accessibilityLabel="Log a new workout">
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
  viewToggleRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md, backgroundColor: colors.cream05, borderRadius: radius.sm, padding: 3 },
  viewToggleButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: spacing.sm, borderRadius: radius.xs },
  viewToggleActive: { backgroundColor: colors.bg.card, borderWidth: 1, borderColor: colors.border.default },
  viewToggleText: { fontSize: typography.sizes.sm, fontWeight: typography.weights.medium, color: colors.fg.tertiary },
  viewToggleTextActive: { color: colors.fg.primary },
  section: { marginBottom: spacing.md },
  sectionTitle: { fontSize: typography.sizes.base, fontWeight: typography.weights.semibold, color: colors.fg.primary, marginBottom: spacing.sm },
  fabSecondary: { position: 'absolute', right: spacing.md, width: 44, height: 44, borderRadius: 22, backgroundColor: colors.bg.card, borderWidth: 1, borderColor: colors.border.default, alignItems: 'center', justifyContent: 'center', elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 3 },
  fab: { position: 'absolute', right: spacing.md, width: 56, height: 56, borderRadius: 28, backgroundColor: colors.button.primaryBg, alignItems: 'center', justifyContent: 'center', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4 },
});
