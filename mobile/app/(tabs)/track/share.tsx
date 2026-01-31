import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import Svg, { Path } from 'react-native-svg';
import { colors, typography, spacing, radius } from '@/theme';
import { Card, Button } from '@/components/ui';
import { getLog, shareLog } from '@/api/track';

const WORKOUT_TYPE_LABELS: Record<string, string> = {
  reformer: 'Reformer',
  mat: 'Mat',
  tower: 'Tower',
  other: 'Other',
};

export default function ShareWorkout() {
  const { logId } = useLocalSearchParams<{ logId: string }>();
  const [caption, setCaption] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['track-log', logId],
    queryFn: () => getLog(logId!),
    enabled: !!logId,
  });

  const log = data?.log;

  const handleShare = async () => {
    if (!logId || submitting) return;
    setSubmitting(true);

    try {
      await shareLog(logId, caption.trim() || undefined);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      queryClient.invalidateQueries({ queryKey: ['track-log', logId] });
      queryClient.invalidateQueries({ queryKey: ['track-logs'] });
      queryClient.invalidateQueries({ queryKey: ['community-feed'] });
      Alert.alert('Shared!', 'Your workout has been shared to the Community.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error: unknown) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      const message = error instanceof Error ? error.message : 'Failed to share workout.';
      Alert.alert('Error', message);
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.centered}><ActivityIndicator color={colors.fg.primary} /></View>
      </SafeAreaView>
    );
  }

  if (!log) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.centered}>
          <Text style={styles.errorText}>Workout not found</Text>
          <Pressable onPress={() => router.back()}><Text style={styles.link}>Go back</Text></Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.closeButton}>
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={colors.fg.primary} strokeWidth={2}>
            <Path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </Pressable>
        <Text style={styles.headerTitle}>Share to Community</Text>
        <View style={{ width: 36 }} />
      </View>

      <View style={styles.content}>
        {/* Workout preview */}
        <Card padding="md" style={styles.previewCard}>
          <View style={styles.previewHeader}>
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={colors.fg.tertiary} strokeWidth={1.5}>
              <Path d="M13 10V3L4 14h7v7l9-11h-7z" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
            <Text style={styles.previewType}>
              {WORKOUT_TYPE_LABELS[log.workoutType] || log.workoutType} Workout
            </Text>
          </View>
          <View style={styles.previewStats}>
            <View style={styles.previewStat}>
              <Text style={styles.previewStatValue}>{log.durationMinutes}m</Text>
              <Text style={styles.previewStatLabel}>Duration</Text>
            </View>
            <View style={styles.previewStat}>
              <Text style={styles.previewStatValue}>{log.rpe}/10</Text>
              <Text style={styles.previewStatLabel}>Intensity</Text>
            </View>
            {log.focusAreas.length > 0 && (
              <View style={styles.previewStat}>
                <Text style={styles.previewStatValue}>{log.focusAreas.length}</Text>
                <Text style={styles.previewStatLabel}>Focus Areas</Text>
              </View>
            )}
          </View>
          {log.studio && (
            <View style={styles.studioRow}>
              <Svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke={colors.fg.tertiary} strokeWidth={1.5}>
                <Path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" strokeLinecap="round" strokeLinejoin="round" />
                <Path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
              <Text style={styles.studioName}>{log.studio.name}</Text>
            </View>
          )}
        </Card>

        {/* Caption */}
        <View style={styles.captionSection}>
          <Text style={styles.fieldLabel}>Caption (optional)</Text>
          <TextInput
            style={styles.captionInput}
            value={caption}
            onChangeText={setCaption}
            placeholder="Add a caption to your workout share..."
            placeholderTextColor={colors.fg.muted}
            multiline
            maxLength={500}
            textAlignVertical="top"
          />
          <Text style={styles.hint}>
            Leave empty for an auto-generated caption with your workout details and streak.
          </Text>
        </View>

        {/* Info */}
        <View style={styles.infoBox}>
          <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={colors.fg.tertiary} strokeWidth={1.5}>
            <Path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
          <Text style={styles.infoText}>
            Workout recaps are automatically approved and visible in the Community feed.
          </Text>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Button
          title={submitting ? 'Sharing...' : 'Share Workout'}
          onPress={handleShare}
          disabled={submitting}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.primary },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  errorText: { fontSize: typography.sizes.base, color: colors.fg.tertiary, marginBottom: spacing.md },
  link: { fontSize: typography.sizes.base, color: colors.fg.primary, textDecorationLine: 'underline' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  closeButton: { padding: spacing.xs },
  headerTitle: { flex: 1, fontSize: typography.sizes.lg, fontWeight: typography.weights.semibold, color: colors.fg.primary, textAlign: 'center' },
  content: { flex: 1, padding: spacing.md },
  previewCard: { marginBottom: spacing.lg },
  previewHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md },
  previewType: { fontSize: typography.sizes.base, fontWeight: typography.weights.semibold, color: colors.fg.primary, textTransform: 'capitalize' },
  previewStats: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: spacing.sm },
  previewStat: { alignItems: 'center' },
  previewStatValue: { fontSize: typography.sizes.xl, fontWeight: typography.weights.semibold, color: colors.fg.primary },
  previewStatLabel: { fontSize: 10, color: colors.fg.tertiary, textTransform: 'uppercase' },
  studioRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, justifyContent: 'center', paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border.default },
  studioName: { fontSize: typography.sizes.sm, color: colors.fg.tertiary },
  captionSection: { marginBottom: spacing.lg },
  fieldLabel: { fontSize: typography.sizes.sm, fontWeight: typography.weights.semibold, color: colors.fg.primary, marginBottom: spacing.xs },
  captionInput: { backgroundColor: colors.bg.card, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border.default, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, fontSize: typography.sizes.base, color: colors.fg.primary, minHeight: 100 },
  hint: { fontSize: typography.sizes.sm, color: colors.fg.muted, marginTop: spacing.xs },
  infoBox: { flexDirection: 'row', gap: spacing.sm, padding: spacing.md, backgroundColor: colors.cream05, borderRadius: radius.md },
  infoText: { fontSize: typography.sizes.sm, color: colors.fg.tertiary, flex: 1, lineHeight: 18 },
  footer: { padding: spacing.md, borderTopWidth: 1, borderTopColor: colors.border.default },
});
