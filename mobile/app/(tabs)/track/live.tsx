import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Svg, { Path } from 'react-native-svg';
import { colors, typography, spacing, radius } from '@/theme';
import { useLiveWorkoutStore } from '@/stores/liveWorkoutStore';
import { createLog } from '@/api/track';

const WORKOUT_TYPES = [
  { label: 'Reformer', value: 'reformer' },
  { label: 'Mat', value: 'mat' },
  { label: 'Tower', value: 'tower' },
  { label: 'Yoga', value: 'yoga' },
  { label: 'Running', value: 'running' },
  { label: 'Strength', value: 'strength_training' },
  { label: 'Stretching', value: 'stretching' },
  { label: 'Other', value: 'other' },
];

function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export default function LiveWorkoutScreen() {
  const store = useLiveWorkoutStore();
  const [elapsed, setElapsed] = useState(0);
  const [rpe, setRpe] = useState(5);
  const [saving, setSaving] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // If not active, show type picker to start
  const [selectedType, setSelectedType] = useState('reformer');

  // Timer update
  useEffect(() => {
    if (store.isActive && !store.pausedAt) {
      intervalRef.current = setInterval(() => {
        setElapsed(store.getElapsedMs());
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [store.isActive, store.pausedAt]);

  // Update elapsed when paused
  useEffect(() => {
    if (store.pausedAt) {
      setElapsed(store.getElapsedMs());
    }
  }, [store.pausedAt]);

  const handleStart = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    store.start(selectedType);
  };

  const handlePauseResume = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (store.pausedAt) {
      store.resume();
    } else {
      store.pause();
    }
  };

  const handleEnd = () => {
    Alert.alert('End Workout?', 'Save this workout to your log?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Discard', style: 'destructive', onPress: () => { store.reset(); router.back(); } },
      {
        text: 'Save',
        onPress: async () => {
          setSaving(true);
          const result = store.end();
          try {
            await createLog({
              durationMinutes: result.durationMinutes,
              workoutType: result.workoutType,
              rpe,
              workoutDate: new Date().toISOString().split('T')[0],
              ...(result.workoutType === 'running' && result.distanceKm > 0 && {
                distanceKm: result.distanceKm,
              }),
            });
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            router.back();
          } catch {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            Alert.alert('Error', 'Failed to save workout.');
          } finally {
            setSaving(false);
          }
        },
      },
    ]);
  };

  // Pre-start screen (type selection)
  if (!store.isActive) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()}>
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={colors.fg.primary} strokeWidth={2}>
              <Path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </Pressable>
          <Text style={styles.headerTitle}>Start Workout</Text>
          <View style={{ width: 20 }} />
        </View>

        <View style={styles.startContent}>
          <Text style={styles.pickLabel}>What are you doing?</Text>
          <View style={styles.typeGrid}>
            {WORKOUT_TYPES.map((t) => (
              <Pressable
                key={t.value}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setSelectedType(t.value);
                }}
                style={[styles.typeChip, selectedType === t.value && styles.typeChipSelected]}
              >
                <Text style={[styles.typeChipText, selectedType === t.value && styles.typeChipTextSelected]}>
                  {t.label}
                </Text>
              </Pressable>
            ))}
          </View>

          <Pressable style={styles.startButton} onPress={handleStart}>
            <Text style={styles.startButtonText}>Start</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // Active workout screen
  const isPaused = !!store.pausedAt;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={{ width: 20 }} />
        <Text style={styles.headerTitle}>
          {WORKOUT_TYPES.find((t) => t.value === store.workoutType)?.label || 'Workout'}
        </Text>
        <View style={{ width: 20 }} />
      </View>

      <View style={styles.timerContent}>
        {/* Timer */}
        <View style={styles.timerCircle}>
          <Text style={styles.timerText}>{formatTime(elapsed)}</Text>
          {isPaused && <Text style={styles.pausedLabel}>PAUSED</Text>}
        </View>

        {/* RPE selector */}
        <Text style={styles.rpeLabel}>Intensity (RPE)</Text>
        <View style={styles.rpeRow}>
          {Array.from({ length: 10 }, (_, i) => i + 1).map((val) => (
            <Pressable
              key={val}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setRpe(val);
              }}
              style={[styles.rpeDot, rpe === val && styles.rpeDotSelected]}
            >
              <Text style={[styles.rpeText, rpe === val && styles.rpeTextSelected]}>
                {val}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          <Pressable style={styles.pauseButton} onPress={handlePauseResume}>
            <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={colors.fg.primary} strokeWidth={2}>
              {isPaused ? (
                <Path d="M5 3l14 9-14 9V3z" strokeLinecap="round" strokeLinejoin="round" />
              ) : (
                <>
                  <Path d="M6 4h4v16H6zM14 4h4v16h-4z" strokeLinecap="round" strokeLinejoin="round" />
                </>
              )}
            </Svg>
            <Text style={styles.controlLabel}>{isPaused ? 'Resume' : 'Pause'}</Text>
          </Pressable>

          <Pressable style={styles.endButton} onPress={handleEnd}>
            <Svg width={24} height={24} viewBox="0 0 24 24" fill="#fff" stroke="none">
              <Path d="M6 6h12v12H6z" />
            </Svg>
            <Text style={styles.endButtonText}>End</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.primary },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
  },
  headerTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.fg.primary,
  },
  startContent: {
    flex: 1,
    padding: spacing.xl,
    justifyContent: 'center',
  },
  pickLabel: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.fg.primary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing['2xl'],
  },
  typeChip: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: radius.md,
    backgroundColor: colors.cream10,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  typeChipSelected: {
    backgroundColor: colors.fg.primary,
    borderColor: colors.fg.primary,
  },
  typeChipText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.fg.secondary,
  },
  typeChipTextSelected: {
    color: colors.bg.primary,
  },
  startButton: {
    backgroundColor: colors.fg.primary,
    borderRadius: 28,
    paddingVertical: 16,
    alignItems: 'center',
    alignSelf: 'center',
    width: 200,
  },
  startButtonText: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.bg.primary,
  },
  timerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  timerCircle: {
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 4,
    borderColor: colors.fg.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing['2xl'],
  },
  timerText: {
    fontSize: 44,
    fontWeight: typography.weights.bold,
    color: colors.fg.primary,
    fontVariant: ['tabular-nums'],
  },
  pausedLabel: {
    fontSize: 12,
    color: colors.fg.tertiary,
    marginTop: 4,
    letterSpacing: 2,
  },
  rpeLabel: {
    fontSize: typography.sizes.sm,
    color: colors.fg.tertiary,
    marginBottom: spacing.sm,
  },
  rpeRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: spacing['2xl'],
  },
  rpeDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.cream10,
  },
  rpeDotSelected: {
    backgroundColor: colors.fg.primary,
  },
  rpeText: {
    fontSize: 11,
    color: colors.fg.tertiary,
    fontWeight: typography.weights.medium,
  },
  rpeTextSelected: {
    color: colors.bg.primary,
    fontWeight: typography.weights.bold,
  },
  controls: {
    flexDirection: 'row',
    gap: spacing.lg,
    alignItems: 'center',
  },
  pauseButton: {
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.cream10,
  },
  controlLabel: {
    fontSize: 12,
    color: colors.fg.secondary,
    fontWeight: typography.weights.medium,
  },
  endButton: {
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    backgroundColor: '#ef4444',
  },
  endButtonText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: typography.weights.semibold,
  },
});
