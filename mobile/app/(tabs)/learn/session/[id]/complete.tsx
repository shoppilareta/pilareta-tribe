import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import Svg, { Path } from 'react-native-svg';
import { colors, typography, spacing, radius } from '@/theme';
import { Button, Card } from '@/components/ui';
import { getSession } from '@/api/learn';
import { createLog } from '@/api/track';

export default function SessionComplete() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['learn-session', id],
    queryFn: () => getSession(id!),
    enabled: !!id,
  });

  const session = data?.session;

  const handleLogWorkout = async () => {
    if (!session) return;
    try {
      await createLog({
        durationMinutes: session.durationMinutes,
        workoutType: session.equipment === 'mat' ? 'mat' : 'reformer',
        rpe: session.rpeTarget,
        focusAreas: session.focusAreas,
        notes: `Completed: ${session.name}`,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      queryClient.invalidateQueries({ queryKey: ['track-stats'] });
      queryClient.invalidateQueries({ queryKey: ['track-logs'] });
      router.replace('/(tabs)/track');
    } catch {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.centered}><ActivityIndicator color={colors.fg.primary} /></View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.content}>
        {/* Success icon */}
        <View style={styles.iconContainer}>
          <Svg width={48} height={48} viewBox="0 0 24 24" fill="none" stroke="rgba(34, 197, 94, 0.8)" strokeWidth={2}>
            <Path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </View>

        <Text style={styles.title}>Session Complete!</Text>

        {session && (
          <Card padding="md" style={styles.summaryCard}>
            <Text style={styles.sessionName}>{session.name}</Text>
            <View style={styles.statsRow}>
              <View style={styles.stat}>
                <Text style={styles.statValue}>{session.durationMinutes}m</Text>
                <Text style={styles.statLabel}>Duration</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statValue}>{session.items?.length || 0}</Text>
                <Text style={styles.statLabel}>Exercises</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statValue}>{session.totalSets}</Text>
                <Text style={styles.statLabel}>Sets</Text>
              </View>
            </View>
          </Card>
        )}

        <View style={styles.actions}>
          <Button title="Log This Workout" onPress={handleLogWorkout} />
          <Button title="Build Another Session" variant="outline" onPress={() => router.replace('/(tabs)/learn/build')} />
          <Pressable onPress={() => router.replace('/(tabs)/learn')} style={styles.textLink}>
            <Text style={styles.textLinkText}>Back to Learn</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.primary },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { flex: 1, padding: spacing.md, alignItems: 'center', justifyContent: 'center' },
  iconContainer: { marginBottom: spacing.lg },
  title: { fontSize: typography.sizes['2xl'], fontWeight: typography.weights.bold, color: colors.fg.primary, marginBottom: spacing.xl },
  summaryCard: { width: '100%', marginBottom: spacing.xl },
  sessionName: { fontSize: typography.sizes.base, fontWeight: typography.weights.semibold, color: colors.fg.primary, textAlign: 'center', marginBottom: spacing.md },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around' },
  stat: { alignItems: 'center' },
  statValue: { fontSize: typography.sizes.xl, fontWeight: typography.weights.semibold, color: colors.fg.primary },
  statLabel: { fontSize: 10, color: colors.fg.tertiary, textTransform: 'uppercase' },
  actions: { width: '100%', gap: spacing.sm },
  textLink: { padding: spacing.md, alignItems: 'center' },
  textLinkText: { fontSize: typography.sizes.sm, color: colors.fg.tertiary, textDecorationLine: 'underline' },
});
