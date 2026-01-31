import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import Svg, { Path } from 'react-native-svg';
import { colors, typography, spacing, radius } from '@/theme';
import { Card } from '@/components/ui';
import { getLog, deleteLog, unshareLog } from '@/api/track';
import { QuickLogForm } from '@/components/track/QuickLogForm';

const WORKOUT_TYPE_LABELS: Record<string, string> = {
  reformer: 'Reformer',
  mat: 'Mat',
  tower: 'Tower',
  other: 'Other',
};

const FOCUS_AREA_LABELS: Record<string, string> = {
  core: 'Core',
  glutes: 'Glutes',
  legs: 'Legs',
  arms: 'Arms',
  back: 'Back',
  mobility: 'Mobility',
};

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatDuration(mins: number): string {
  if (mins < 60) return `${mins} min`;
  const hours = Math.floor(mins / 60);
  const remaining = mins % 60;
  if (remaining === 0) return `${hours}h`;
  return `${hours}h ${remaining}m`;
}

export default function LogDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ['track-log', id],
    queryFn: () => getLog(id!),
    enabled: !!id,
  });

  const handleDelete = () => {
    Alert.alert(
      'Delete Workout',
      'Are you sure you want to delete this workout log?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            try {
              await deleteLog(id!);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              queryClient.invalidateQueries({ queryKey: ['track-stats'] });
              queryClient.invalidateQueries({ queryKey: ['track-logs'] });
              router.back();
            } catch {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
              Alert.alert('Error', 'Failed to delete workout');
              setDeleting(false);
            }
          },
        },
      ],
    );
  };

  const handleEditComplete = () => {
    setIsEditing(false);
    queryClient.invalidateQueries({ queryKey: ['track-log', id] });
    queryClient.invalidateQueries({ queryKey: ['track-stats'] });
    queryClient.invalidateQueries({ queryKey: ['track-logs'] });
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.centered}>
          <ActivityIndicator color={colors.fg.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !data?.log) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.centered}>
          <Text style={styles.errorText}>Workout not found</Text>
          <Pressable onPress={() => router.back()} style={styles.backLink}>
            <Text style={styles.backLinkText}>Go back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const log = data.log;

  if (isEditing) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Edit Workout</Text>
        </View>
        <QuickLogForm
          onComplete={handleEditComplete}
          onCancel={() => setIsEditing(false)}
          editLog={{
            id: log.id,
            workoutDate: log.workoutDate,
            durationMinutes: log.durationMinutes,
            workoutType: log.workoutType,
            rpe: log.rpe,
            notes: log.notes,
            focusAreas: log.focusAreas,
            studioId: log.studioId,
            customStudioName: log.customStudioName,
          }}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header with back + actions */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={colors.fg.primary} strokeWidth={2}>
            <Path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </Pressable>
        <Text style={styles.headerTitle}>Workout Details</Text>
        <View style={styles.headerActions}>
          <Pressable onPress={() => router.push({ pathname: '/(tabs)/track/recap', params: { logId: log.id } })} style={styles.actionButton}>
            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={colors.fg.secondary} strokeWidth={1.5}>
              <Path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </Pressable>
          {!log.isShared && (
            <Pressable onPress={() => router.push({ pathname: '/(tabs)/track/share', params: { logId: log.id } })} style={styles.actionButton}>
              <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={colors.fg.secondary} strokeWidth={1.5}>
                <Path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            </Pressable>
          )}
          <Pressable onPress={() => setIsEditing(true)} style={styles.actionButton}>
            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={colors.fg.secondary} strokeWidth={1.5}>
              <Path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" strokeLinecap="round" strokeLinejoin="round" />
              <Path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </Pressable>
          <Pressable onPress={handleDelete} style={styles.actionButton} disabled={deleting}>
            {deleting ? (
              <ActivityIndicator size="small" color={colors.fg.secondary} />
            ) : (
              <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={colors.fg.secondary} strokeWidth={1.5}>
                <Path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            )}
          </Pressable>
        </View>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Date & Type */}
        <Text style={styles.date}>{formatDate(log.workoutDate)}</Text>
        <Text style={styles.type}>{WORKOUT_TYPE_LABELS[log.workoutType] || log.workoutType}</Text>

        {/* Key stats row */}
        <View style={styles.statsRow}>
          <Card padding="md" style={styles.statCard}>
            <Text style={styles.statValue}>{formatDuration(log.durationMinutes)}</Text>
            <Text style={styles.statLabel}>Duration</Text>
          </Card>
          <Card padding="md" style={styles.statCard}>
            <Text style={styles.statValue}>{log.rpe}/10</Text>
            <Text style={styles.statLabel}>Intensity</Text>
          </Card>
          {log.calorieEstimate && (
            <Card padding="md" style={styles.statCard}>
              <Text style={styles.statValue}>{log.calorieEstimate}</Text>
              <Text style={styles.statLabel}>Calories</Text>
            </Card>
          )}
        </View>

        {/* Focus Areas */}
        {log.focusAreas.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Focus Areas</Text>
            <View style={styles.chipRow}>
              {log.focusAreas.map((area) => (
                <View key={area} style={styles.chip}>
                  <Text style={styles.chipText}>{FOCUS_AREA_LABELS[area] || area}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Studio */}
        {(log.studio || log.customStudioName) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Studio</Text>
            <Text style={styles.sectionValue}>
              {log.studio ? `${log.studio.name} - ${log.studio.city}` : log.customStudioName}
            </Text>
          </View>
        )}

        {/* Notes */}
        {log.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <Text style={styles.notesText}>{log.notes}</Text>
          </View>
        )}

        {/* Session link */}
        {log.session && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Session</Text>
            <Text style={styles.sectionValue}>{log.session.name}</Text>
          </View>
        )}

        {/* Shared status */}
        {log.isShared && (
          <View style={styles.sharedSection}>
            <View style={styles.sharedRow}>
              <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="rgba(34, 197, 94, 0.8)" strokeWidth={1.5}>
                <Path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
              <Text style={styles.sharedText}>Shared to Community</Text>
            </View>
            <Pressable
              onPress={() => {
                Alert.alert('Unshare Workout', 'This will remove the post from the Community feed.', [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Unshare',
                    style: 'destructive',
                    onPress: async () => {
                      try {
                        await unshareLog(log.id);
                        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                        queryClient.invalidateQueries({ queryKey: ['track-log', id] });
                        queryClient.invalidateQueries({ queryKey: ['track-logs'] });
                        queryClient.invalidateQueries({ queryKey: ['community-feed'] });
                      } catch {
                        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                      }
                    },
                  },
                ]);
              }}
              style={styles.unshareButton}
            >
              <Text style={styles.unshareText}>Unshare</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg.primary,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  errorText: {
    fontSize: typography.sizes.base,
    color: colors.fg.tertiary,
    marginBottom: spacing.md,
  },
  backLink: {
    padding: spacing.sm,
  },
  backLinkText: {
    fontSize: typography.sizes.base,
    color: colors.fg.primary,
    textDecorationLine: 'underline',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  backButton: {
    padding: spacing.xs,
    marginRight: spacing.sm,
  },
  headerTitle: {
    flex: 1,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.fg.primary,
  },
  headerActions: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  actionButton: {
    padding: spacing.sm,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
    paddingBottom: 100,
  },
  date: {
    fontSize: typography.sizes.base,
    color: colors.fg.secondary,
    marginBottom: 4,
  },
  type: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    color: colors.fg.primary,
    marginBottom: spacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
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
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.fg.tertiary,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionValue: {
    fontSize: typography.sizes.base,
    color: colors.fg.primary,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.sm,
    backgroundColor: colors.cream10,
  },
  chipText: {
    fontSize: typography.sizes.sm,
    color: colors.fg.secondary,
    fontWeight: typography.weights.medium,
  },
  notesText: {
    fontSize: typography.sizes.base,
    color: colors.fg.primary,
    lineHeight: 22,
  },
  sharedSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    backgroundColor: colors.cream05,
    borderRadius: radius.md,
    marginBottom: spacing.lg,
  },
  sharedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  sharedText: {
    fontSize: typography.sizes.sm,
    color: 'rgba(34, 197, 94, 0.8)',
    fontWeight: typography.weights.medium,
  },
  unshareButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  unshareText: {
    fontSize: typography.sizes.sm,
    color: colors.fg.tertiary,
    textDecorationLine: 'underline',
  },
});
