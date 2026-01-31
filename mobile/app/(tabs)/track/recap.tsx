import { useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import ViewShot from 'react-native-view-shot';
import * as Haptics from 'expo-haptics';
import Svg, { Path } from 'react-native-svg';
import { colors, typography, spacing } from '@/theme';
import { getLog, getStats } from '@/api/track';
import { RecapCard } from '@/components/track/RecapCard';

export default function RecapScreen() {
  const { logId } = useLocalSearchParams<{ logId: string }>();
  const viewShotRef = useRef<ViewShot>(null);
  const [sharing, setSharing] = useState(false);

  const { data: logData, isLoading: logLoading } = useQuery({
    queryKey: ['track-log', logId],
    queryFn: () => getLog(logId!),
    enabled: !!logId,
  });

  const { data: statsData } = useQuery({
    queryKey: ['track-stats'],
    queryFn: getStats,
  });

  const handleShare = async () => {
    if (!viewShotRef.current?.capture) return;
    setSharing(true);

    try {
      const uri = await viewShotRef.current.capture();

      // Save to a proper file path for sharing
      const fileUri = FileSystem.cacheDirectory + 'pilareta-recap.png';
      await FileSystem.copyAsync({ from: uri, to: fileUri });

      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'image/png',
          dialogTitle: 'Share your Pilareta workout',
        });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        Alert.alert('Sharing not available', 'Sharing is not supported on this device.');
      }
    } catch {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', 'Failed to share recap card.');
    } finally {
      setSharing(false);
    }
  };

  const handleSaveImage = async () => {
    if (!viewShotRef.current?.capture) return;
    setSharing(true);

    try {
      const uri = await viewShotRef.current.capture();
      const fileUri = FileSystem.documentDirectory + `pilareta-recap-${Date.now()}.png`;
      await FileSystem.copyAsync({ from: uri, to: fileUri });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Saved', 'Recap card saved to device.');
    } catch {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', 'Failed to save image.');
    } finally {
      setSharing(false);
    }
  };

  if (logLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.centered}>
          <ActivityIndicator color={colors.fg.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!logData?.log) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.centered}>
          <Text style={styles.errorText}>Workout not found</Text>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.link}>Go back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const log = logData.log;
  const streak = statsData?.stats?.currentStreak || 0;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.closeButton}>
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={colors.fg.primary} strokeWidth={2}>
            <Path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </Pressable>
        <Text style={styles.headerTitle}>Recap Card</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Card preview */}
      <View style={styles.cardContainer}>
        <ViewShot
          ref={viewShotRef}
          options={{ format: 'png', quality: 1.0 }}
          style={styles.viewShot}
        >
          <RecapCard
            workoutDate={log.workoutDate}
            durationMinutes={log.durationMinutes}
            workoutType={log.workoutType}
            rpe={log.rpe}
            calorieEstimate={log.calorieEstimate}
            studioName={log.studio?.name || log.customStudioName}
            sessionName={log.session?.name}
            currentStreak={streak}
            focusAreas={log.focusAreas}
          />
        </ViewShot>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <Pressable
          style={styles.actionButton}
          onPress={handleShare}
          disabled={sharing}
        >
          {sharing ? (
            <ActivityIndicator color={colors.fg.primary} size="small" />
          ) : (
            <>
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={colors.fg.primary} strokeWidth={1.5}>
                <Path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
              <Text style={styles.actionText}>Share</Text>
            </>
          )}
        </Pressable>

        <Pressable
          style={styles.actionButton}
          onPress={handleSaveImage}
          disabled={sharing}
        >
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={colors.fg.primary} strokeWidth={1.5}>
            <Path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
          <Text style={styles.actionText}>Save Image</Text>
        </Pressable>
      </View>

      <Text style={styles.hint}>
        Share your workout recap to Instagram Stories, WhatsApp, or save it to your gallery.
      </Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.primary },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  errorText: { fontSize: typography.sizes.base, color: colors.fg.tertiary, marginBottom: spacing.md },
  link: { fontSize: typography.sizes.base, color: colors.fg.primary, textDecorationLine: 'underline' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  closeButton: { padding: spacing.xs },
  headerTitle: {
    flex: 1,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.fg.primary,
    textAlign: 'center',
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  viewShot: {
    backgroundColor: '#202219',
    borderRadius: 16,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.bg.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border.default,
    paddingVertical: 14,
  },
  actionText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.fg.primary,
  },
  hint: {
    fontSize: typography.sizes.sm,
    color: colors.fg.muted,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.md,
  },
});
