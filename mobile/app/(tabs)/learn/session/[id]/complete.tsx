import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import Svg, { Path } from 'react-native-svg';
import { colors, typography, spacing, radius } from '@/theme';
import { Button, Card } from '@/components/ui';
import { getSession } from '@/api/learn';
import { createLog } from '@/api/track';
import { saveSession } from '@/utils/savedSessions';

function formatElapsed(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m >= 60) {
    const h = Math.floor(m / 60);
    const rm = m % 60;
    return `${h}h ${rm}m ${s}s`;
  }
  return `${m}m ${s}s`;
}

function getMotivationalMessage(durationMinutes: number, rpe: number, exerciseCount: number): string {
  if (durationMinutes >= 45 && rpe >= 7) {
    return 'Incredible effort! You pushed through a challenging workout.';
  }
  if (durationMinutes >= 30) {
    return 'Great session! Consistency is the key to progress.';
  }
  if (rpe >= 7) {
    return 'You brought the intensity! Your body will thank you.';
  }
  if (exerciseCount >= 8) {
    return 'Solid variety in your workout. Well done!';
  }
  return 'Every session counts. Keep building your practice!';
}

export default function SessionComplete() {
  const { id, elapsed } = useLocalSearchParams<{ id: string; elapsed?: string }>();
  const queryClient = useQueryClient();
  const [saved, setSaved] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [showSaveInput, setShowSaveInput] = useState(false);

  const elapsedSeconds = elapsed ? parseInt(elapsed, 10) : 0;

  const { data, isLoading } = useQuery({
    queryKey: ['learn-session', id],
    queryFn: () => getSession(id!),
    enabled: !!id,
  });

  const session = data?.session;
  const exerciseCount = session?.items?.length ?? 0;

  const handleLogWorkout = async () => {
    if (!session) return;
    try {
      await createLog({
        durationMinutes: elapsedSeconds > 0 ? Math.round(elapsedSeconds / 60) : session.durationMinutes,
        workoutType: session.equipment === 'mat' ? 'mat' : 'reformer',
        rpe: session.rpeTarget,
        focusAreas: session.focusAreas,
        notes: `Completed: ${session.name}`,
        sessionId: session.id,
        totalSets: session.totalSets,
        totalReps: session.totalReps ?? undefined,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      queryClient.invalidateQueries({ queryKey: ['track-stats'] });
      queryClient.invalidateQueries({ queryKey: ['track-logs'] });
      router.replace('/(tabs)/track');
    } catch {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const handleSaveSession = useCallback(async () => {
    if (!session || !id) return;
    const name = saveName.trim() || session.name;
    await saveSession({
      name,
      sessionId: id,
      createdAt: new Date().toISOString(),
    });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setSaved(true);
    setShowSaveInput(false);
  }, [session, id, saveName]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.centered}><ActivityIndicator color={colors.fg.primary} /></View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Success icon */}
        <View style={styles.iconContainer}>
          <Svg width={56} height={56} viewBox="0 0 24 24" fill="none" stroke="rgba(34, 197, 94, 0.8)" strokeWidth={2}>
            <Path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </View>

        <Text style={styles.title}>Session Complete!</Text>

        {/* Motivational message */}
        {session && (
          <Text style={styles.motivational}>
            {getMotivationalMessage(session.durationMinutes, session.rpeTarget, exerciseCount)}
          </Text>
        )}

        {session && (
          <Card padding="md" style={styles.summaryCard}>
            <Text style={styles.sessionName}>{session.name}</Text>
            <View style={styles.statsRow}>
              {elapsedSeconds > 0 && (
                <View style={styles.stat}>
                  <Text style={styles.statValue}>{formatElapsed(elapsedSeconds)}</Text>
                  <Text style={styles.statLabel}>Time</Text>
                </View>
              )}
              {!elapsedSeconds && (
                <View style={styles.stat}>
                  <Text style={styles.statValue}>{session.durationMinutes}m</Text>
                  <Text style={styles.statLabel}>Duration</Text>
                </View>
              )}
              <View style={styles.stat}>
                <Text style={styles.statValue}>{exerciseCount}</Text>
                <Text style={styles.statLabel}>Exercises</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statValue}>{session.totalSets}</Text>
                <Text style={styles.statLabel}>Sets</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statValue}>{session.rpeTarget}/10</Text>
                <Text style={styles.statLabel}>RPE</Text>
              </View>
            </View>
          </Card>
        )}

        {/* Exercise checklist */}
        {session?.items && session.items.length > 0 && (
          <View style={styles.exerciseList}>
            <Text style={styles.exerciseListTitle}>Exercises Completed</Text>
            {session.items.map((item, i) => (
              <View key={item.id || i} style={styles.exerciseRow}>
                <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="rgba(34, 197, 94, 0.8)" strokeWidth={2.5}>
                  <Path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
                <Text style={styles.exerciseRowName} numberOfLines={1}>{item.exercise.name}</Text>
                <Text style={styles.exerciseRowDetail}>
                  {item.sets}x{item.reps ? `${item.reps}` : item.duration ? `${item.duration}s` : ''}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Save session option */}
        {!saved && !showSaveInput && (
          <Pressable onPress={() => setShowSaveInput(true)} style={styles.saveSessionButton}>
            <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={colors.fg.primary} strokeWidth={2}>
              <Path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" strokeLinecap="round" strokeLinejoin="round" />
              <Path d="M17 21v-8H7v8M7 3v5h8" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
            <Text style={styles.saveSessionText}>Save This Session</Text>
          </Pressable>
        )}

        {showSaveInput && (
          <View style={styles.saveInputRow}>
            <TextInput
              style={styles.saveInput}
              placeholder={session?.name || 'Session name'}
              placeholderTextColor={colors.fg.tertiary}
              value={saveName}
              onChangeText={setSaveName}
              autoFocus
            />
            <Pressable onPress={handleSaveSession} style={styles.saveConfirmButton}>
              <Text style={styles.saveConfirmText}>Save</Text>
            </Pressable>
          </View>
        )}

        {saved && (
          <View style={styles.savedBadge}>
            <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="rgba(34, 197, 94, 0.8)" strokeWidth={2.5}>
              <Path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
            <Text style={styles.savedText}>Session saved</Text>
          </View>
        )}

        <View style={styles.actions}>
          <Button title="Log This Workout" onPress={handleLogWorkout} />
          <Button title="Build Another Session" variant="outline" onPress={() => router.replace('/(tabs)/learn/build')} />
          <Pressable onPress={() => router.replace('/(tabs)/learn')} style={styles.textLink}>
            <Text style={styles.textLinkText}>Back to Learn</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.primary },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { padding: spacing.md, alignItems: 'center', paddingTop: spacing['2xl'], paddingBottom: 100 },
  iconContainer: { marginBottom: spacing.md },
  title: { fontSize: typography.sizes['2xl'], fontWeight: typography.weights.bold, color: colors.fg.primary, marginBottom: spacing.sm },
  motivational: { fontSize: typography.sizes.sm, color: colors.fg.secondary, textAlign: 'center', lineHeight: 20, marginBottom: spacing.xl, paddingHorizontal: spacing.md },
  summaryCard: { width: '100%', marginBottom: spacing.lg },
  sessionName: { fontSize: typography.sizes.base, fontWeight: typography.weights.semibold, color: colors.fg.primary, textAlign: 'center', marginBottom: spacing.md },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', flexWrap: 'wrap', gap: spacing.sm },
  stat: { alignItems: 'center', minWidth: 60 },
  statValue: { fontSize: typography.sizes.lg, fontWeight: typography.weights.semibold, color: colors.fg.primary },
  statLabel: { fontSize: 10, color: colors.fg.tertiary, textTransform: 'uppercase' },
  exerciseList: { width: '100%', marginBottom: spacing.lg },
  exerciseListTitle: { fontSize: typography.sizes.sm, fontWeight: typography.weights.semibold, color: colors.fg.primary, marginBottom: spacing.sm },
  exerciseRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: 6, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border.default },
  exerciseRowName: { flex: 1, fontSize: typography.sizes.sm, color: colors.fg.secondary },
  exerciseRowDetail: { fontSize: typography.sizes.xs, color: colors.fg.tertiary },
  saveSessionButton: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, paddingVertical: spacing.sm, paddingHorizontal: spacing.md, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.border.default, marginBottom: spacing.lg },
  saveSessionText: { fontSize: typography.sizes.sm, color: colors.fg.primary, fontWeight: typography.weights.medium },
  saveInputRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, width: '100%', marginBottom: spacing.lg },
  saveInput: { flex: 1, borderWidth: 1, borderColor: colors.border.default, borderRadius: radius.sm, paddingHorizontal: spacing.sm, paddingVertical: 8, fontSize: typography.sizes.sm, color: colors.fg.primary },
  saveConfirmButton: { backgroundColor: colors.button.primaryBg, paddingHorizontal: spacing.md, paddingVertical: 10, borderRadius: radius.sm },
  saveConfirmText: { fontSize: typography.sizes.sm, fontWeight: typography.weights.semibold, color: colors.button.primaryText },
  savedBadge: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: spacing.lg },
  savedText: { fontSize: typography.sizes.sm, color: 'rgba(34, 197, 94, 0.8)' },
  actions: { width: '100%', gap: spacing.sm },
  textLink: { padding: spacing.md, alignItems: 'center' },
  textLinkText: { fontSize: typography.sizes.sm, color: colors.fg.tertiary, textDecorationLine: 'underline' },
});
