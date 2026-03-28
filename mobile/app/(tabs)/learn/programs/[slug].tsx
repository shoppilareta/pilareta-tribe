import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import Svg, { Path } from 'react-native-svg';
import { colors, typography, spacing, radius } from '@/theme';
import { Card, Badge } from '@/components/ui';
import { getProgram, getProgramProgress } from '@/api/learn';

interface ProgramWeek {
  weekNumber: number;
  title: string;
  focus: string;
  sessions: {
    dayNumber: number;
    title: string;
    sessionId?: string | null;
    template?: {
      name: string;
      durationMinutes: number;
      items: {
        orderIndex: number;
        section: string;
        sets: number;
        reps: number | null;
        duration: number | null;
        exercise: { name: string; slug: string };
      }[];
    };
  }[];
}

interface ProgramDetail {
  id: string;
  name: string;
  description: string;
  durationWeeks: number;
  sessionsPerWeek: number;
  equipment: string;
  level: string;
  focusAreas: string[];
  benefits: string[];
  prerequisites: string | null;
  weeks: ProgramWeek[];
}

const SECTION_COLORS: Record<string, string> = {
  warmup: 'rgba(255, 200, 100, 0.3)',
  activation: 'rgba(100, 200, 255, 0.3)',
  main: 'rgba(255, 100, 150, 0.3)',
  cooldown: 'rgba(150, 255, 150, 0.3)',
};

export default function ProgramDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const [expandedWeek, setExpandedWeek] = useState<number | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['learn-program', slug],
    queryFn: () => getProgram(slug!),
    enabled: !!slug,
  });

  // 3B: Program progress - graceful when user hasn't started
  const { data: progressData } = useQuery({
    queryKey: ['program-progress', slug],
    queryFn: () => getProgramProgress(slug!),
    enabled: !!slug,
    retry: 1,
  });

  const progress = progressData?.progress ?? null;

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.centered}><ActivityIndicator color={colors.fg.primary} /></View>
      </SafeAreaView>
    );
  }

  const program = data?.program as ProgramDetail | undefined;
  if (!program) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.centered}>
          <Text style={styles.errorText}>Program not found</Text>
          <Pressable onPress={() => router.back()}><Text style={styles.link}>Go back</Text></Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const totalSessions = program.durationWeeks * program.sessionsPerWeek;

  // Find the first session to start with (for "Start Program" button)
  const firstSessionId = (() => {
    for (const week of program.weeks ?? []) {
      for (const session of week.sessions ?? []) {
        if (session.sessionId) return session.sessionId;
      }
    }
    return null;
  })();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={colors.fg.primary} strokeWidth={2}>
            <Path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>{program.name}</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.badgeRow}>
          <Badge text={program.level} variant="default" />
          <Badge text={program.equipment} variant="accent" />
        </View>

        <Text style={styles.description}>{program.description}</Text>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <Card padding="sm" style={styles.statCard}>
            <Text style={styles.statValue}>{program.durationWeeks}</Text>
            <Text style={styles.statLabel}>Weeks</Text>
          </Card>
          <Card padding="sm" style={styles.statCard}>
            <Text style={styles.statValue}>{program.sessionsPerWeek}</Text>
            <Text style={styles.statLabel}>Per Week</Text>
          </Card>
          <Card padding="sm" style={styles.statCard}>
            <Text style={styles.statValue}>{totalSessions}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </Card>
        </View>

        {/* Prominent Start / Resume button */}
        {!progress && firstSessionId && (
          <Pressable
            onPress={() => router.push(`/(tabs)/learn/session/${firstSessionId}`)}
            style={styles.startProgramButton}
          >
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={colors.button.primaryText} strokeWidth={2.5}>
              <Path d="M5 3l14 9-14 9V3z" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
            <Text style={styles.startProgramText}>Start Program</Text>
          </Pressable>
        )}

        {/* 3B: Program progress - handles in_progress and completed */}
        {progress && progress.status !== 'completed' && (
          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressTitle}>Your Progress</Text>
              <Badge text={progress.status === 'in_progress' ? 'In Progress' : 'Paused'} variant={progress.status === 'in_progress' ? 'success' : 'warning'} />
            </View>
            <Text style={styles.progressInfo}>
              Week {progress.currentWeek} of {program.durationWeeks}  {'\u00B7'}  {progress.completedSessionIds.length} / {totalSessions} sessions
            </Text>
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBarFill, { width: `${totalSessions > 0 ? Math.round((progress.completedSessionIds.length / totalSessions) * 100) : 0}%` }]} />
            </View>
            {/* Find next uncompleted session and add Resume button */}
            {(() => {
              for (const week of program.weeks ?? []) {
                for (const session of week.sessions ?? []) {
                  if (session.sessionId && !progress.completedSessionIds.includes(session.sessionId)) {
                    return (
                      <Pressable
                        key={session.sessionId}
                        onPress={() => router.push(`/(tabs)/learn/session/${session.sessionId}`)}
                        style={styles.resumeButton}
                      >
                        <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={colors.bg.primary} strokeWidth={2}>
                          <Path d="M5 3l14 9-14 9V3z" strokeLinecap="round" strokeLinejoin="round" />
                        </Svg>
                        <Text style={styles.resumeButtonText}>Resume - Week {week.weekNumber}, Day {session.dayNumber}</Text>
                      </Pressable>
                    );
                  }
                }
              }
              return null;
            })()}
          </View>
        )}

        {/* Completed state */}
        {progress && progress.status === 'completed' && (
          <View style={styles.completedCard}>
            <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="rgba(34, 197, 94, 0.8)" strokeWidth={2}>
              <Path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
            <Text style={styles.completedText}>Program completed! Great work.</Text>
          </View>
        )}

        {/* Benefits */}
        {program.benefits && program.benefits.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Benefits</Text>
            {program.benefits.map((b, i) => (
              <Text key={i} style={styles.bulletText}>{'\u2022'} {b}</Text>
            ))}
          </View>
        )}

        {/* Prerequisites */}
        {program.prerequisites && (
          <Card padding="md" style={styles.prereqCard}>
            <Text style={styles.prereqLabel}>Prerequisites</Text>
            <Text style={styles.prereqText}>{program.prerequisites}</Text>
          </Card>
        )}

        {/* Weekly schedule */}
        <Text style={styles.sectionTitle}>Weekly Schedule</Text>
        {(program.weeks ?? []).map((week) => (
          <View key={week.weekNumber} style={styles.weekContainer}>
            <Pressable
              onPress={() => setExpandedWeek(expandedWeek === week.weekNumber ? null : week.weekNumber)}
              style={styles.weekHeader}
            >
              <View style={{ flex: 1 }}>
                <View style={styles.weekTitleRow}>
                  <Text style={styles.weekTitle}>{week.title || `Week ${week.weekNumber}`}</Text>
                  {progress && (() => {
                    const weekSessionIds = (week.sessions ?? []).map((s) => s.sessionId).filter(Boolean) as string[];
                    const completedCount = weekSessionIds.filter((sid) => (progress.completedSessionIds ?? []).includes(sid)).length;
                    if (weekSessionIds.length === 0) return null;
                    return (
                      <Text style={styles.weekProgress}>
                        {completedCount}/{weekSessionIds.length}
                      </Text>
                    );
                  })()}
                </View>
                {week.focus ? <Text style={styles.weekFocus}>{week.focus}</Text> : null}
              </View>
              <Text style={styles.chevron}>{expandedWeek === week.weekNumber ? '\u25B2' : '\u25BC'}</Text>
            </Pressable>

            {expandedWeek === week.weekNumber && (week.sessions ?? []).map((session) => (
              <View key={session.dayNumber} style={styles.sessionContainer}>
                <Text style={styles.sessionTitle}>Day {session.dayNumber}: {session.title}</Text>
                {session.template?.items?.map((item) => (
                  <View key={item.orderIndex} style={styles.exerciseItem}>
                    <View style={[styles.sectionDot, { backgroundColor: SECTION_COLORS[item.section] || colors.cream10 }]} />
                    <View style={styles.exerciseInfo}>
                      <Text style={styles.exerciseName}>{item.exercise.name}</Text>
                      <Text style={styles.exerciseDetails}>
                        {item.sets} sets
                        {item.reps ? ` x ${item.reps} reps` : ''}
                        {item.duration ? ` x ${item.duration}s` : ''}
                      </Text>
                    </View>
                    {/* Completion checkmark */}
                    {progress && session.sessionId && progress.completedSessionIds.includes(session.sessionId) && (
                      <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="rgba(34, 197, 94, 0.8)" strokeWidth={2.5}>
                        <Path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                      </Svg>
                    )}
                  </View>
                ))}
                {session.sessionId && (
                  <Pressable
                    onPress={() => router.push(`/(tabs)/learn/session/${session.sessionId}`)}
                    style={[
                      styles.startWorkoutButton,
                      progress && progress.completedSessionIds.includes(session.sessionId) && styles.startWorkoutButtonCompleted,
                    ]}
                  >
                    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={progress && progress.completedSessionIds.includes(session.sessionId) ? colors.fg.secondary : colors.bg.primary} strokeWidth={2}>
                      <Path d="M5 3l14 9-14 9V3z" strokeLinecap="round" strokeLinejoin="round" />
                    </Svg>
                    <Text style={[
                      styles.startWorkoutText,
                      progress && progress.completedSessionIds.includes(session.sessionId) && styles.startWorkoutTextCompleted,
                    ]}>
                      {progress && progress.completedSessionIds.includes(session.sessionId) ? 'Redo Workout' : 'Start Workout'}
                    </Text>
                  </Pressable>
                )}
              </View>
            ))}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.primary },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  errorText: { fontSize: typography.sizes.base, color: colors.fg.tertiary, marginBottom: spacing.md },
  link: { fontSize: typography.sizes.base, color: colors.fg.primary, textDecorationLine: 'underline' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  backButton: { padding: spacing.xs, marginRight: spacing.sm },
  headerTitle: { flex: 1, fontSize: typography.sizes.lg, fontWeight: typography.weights.semibold, color: colors.fg.primary },
  scroll: { flex: 1 },
  content: { padding: spacing.md, paddingBottom: 100 },
  badgeRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  description: { fontSize: typography.sizes.base, color: colors.fg.secondary, lineHeight: 22, marginBottom: spacing.lg },
  statsRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  statCard: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: typography.sizes.xl, fontWeight: typography.weights.semibold, color: colors.fg.primary },
  statLabel: { fontSize: 10, color: colors.fg.tertiary, textTransform: 'uppercase' },
  startProgramButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.button.primaryBg,
    paddingVertical: 14,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.md,
    marginBottom: spacing.lg,
  },
  startProgramText: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.button.primaryText,
  },
  section: { marginBottom: spacing.lg },
  sectionTitle: { fontSize: typography.sizes.base, fontWeight: typography.weights.semibold, color: colors.fg.primary, marginBottom: spacing.sm },
  bulletText: { fontSize: typography.sizes.sm, color: colors.fg.secondary, lineHeight: 20, marginBottom: 2 },
  prereqCard: { marginBottom: spacing.lg, backgroundColor: colors.cream10 },
  prereqLabel: { fontSize: typography.sizes.sm, fontWeight: typography.weights.semibold, color: colors.fg.primary, marginBottom: 4 },
  prereqText: { fontSize: typography.sizes.sm, color: colors.fg.secondary, lineHeight: 18 },
  progressCard: { backgroundColor: colors.bg.card, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border.default, padding: spacing.md, marginBottom: spacing.lg },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xs },
  progressTitle: { fontSize: typography.sizes.base, fontWeight: typography.weights.semibold, color: colors.fg.primary },
  progressInfo: { fontSize: typography.sizes.sm, color: colors.fg.secondary, marginBottom: spacing.sm },
  progressBarContainer: { height: 6, backgroundColor: colors.cream10, borderRadius: 3, marginBottom: spacing.sm, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: 'rgba(34, 197, 94, 0.8)', borderRadius: 3 },
  resumeButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.xs, backgroundColor: colors.button.primaryBg, paddingVertical: 10, paddingHorizontal: spacing.md, borderRadius: radius.sm },
  resumeButtonText: { fontSize: typography.sizes.sm, fontWeight: typography.weights.semibold, color: colors.button.primaryText },
  completedCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: 'rgba(34, 197, 94, 0.08)', borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.lg },
  completedText: { fontSize: typography.sizes.base, color: 'rgba(34, 197, 94, 0.9)', fontWeight: typography.weights.medium, flex: 1 },
  weekContainer: { backgroundColor: colors.bg.card, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border.default, marginBottom: spacing.sm, overflow: 'hidden' },
  weekHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.md },
  weekTitleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  weekTitle: { fontSize: typography.sizes.base, fontWeight: typography.weights.semibold, color: colors.fg.primary },
  weekProgress: { fontSize: typography.sizes.xs, color: 'rgba(34, 197, 94, 0.8)', fontWeight: typography.weights.medium },
  weekFocus: { fontSize: typography.sizes.sm, color: colors.fg.tertiary, marginTop: 2 },
  chevron: { fontSize: 12, color: colors.fg.tertiary },
  sessionContainer: { paddingHorizontal: spacing.md, paddingBottom: spacing.md, borderTopWidth: 1, borderTopColor: colors.border.default },
  sessionTitle: { fontSize: typography.sizes.sm, fontWeight: typography.weights.semibold, color: colors.fg.secondary, paddingVertical: spacing.sm },
  exerciseItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: 4 },
  sectionDot: { width: 8, height: 8, borderRadius: 4 },
  exerciseInfo: { flex: 1 },
  exerciseName: { fontSize: typography.sizes.sm, color: colors.fg.primary },
  exerciseDetails: { fontSize: 11, color: colors.fg.tertiary },
  startWorkoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.xs, backgroundColor: colors.button.primaryBg, paddingVertical: 10, paddingHorizontal: spacing.md, borderRadius: radius.sm, marginTop: spacing.sm },
  startWorkoutButtonCompleted: { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.border.default },
  startWorkoutText: { fontSize: typography.sizes.sm, fontWeight: typography.weights.semibold, color: colors.button.primaryText },
  startWorkoutTextCompleted: { color: colors.fg.secondary },
});
