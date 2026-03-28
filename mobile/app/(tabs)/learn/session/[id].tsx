import { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import Svg, { Path } from 'react-native-svg';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import { colors, typography, spacing, radius } from '@/theme';
import { Button } from '@/components/ui';
import { getSession } from '@/api/learn';
import type { PilatesSessionItem } from '@shared/types';

const SECTION_COLORS: Record<string, string> = {
  warmup: 'rgba(255, 200, 100, 0.3)',
  activation: 'rgba(100, 200, 255, 0.3)',
  main: 'rgba(255, 100, 150, 0.3)',
  cooldown: 'rgba(150, 255, 150, 0.3)',
};

const SECTION_LABELS: Record<string, string> = {
  warmup: 'Warm Up',
  activation: 'Activation',
  main: 'Main Set',
  cooldown: 'Cool Down',
};

function formatElapsed(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function SessionPlayer() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [isResting, setIsResting] = useState(false);
  const [restTime, setRestTime] = useState(0);
  const [showDetails, setShowDetails] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [videoError, setVideoError] = useState(false);
  const restEndTimeRef = useRef<number>(0);
  const elapsedStartRef = useRef<number>(0);
  const elapsedOffsetRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const elapsedRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const videoRef = useRef<Video>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['learn-session', id],
    queryFn: () => getSession(id!),
    enabled: !!id,
  });

  const items = data?.session?.items ?? [];
  const session = data?.session;
  const currentItem: PilatesSessionItem | undefined = items[currentIndex];
  const totalItems = items.length;

  // Granular progress: account for current set within current exercise
  const exerciseProgress = totalItems > 0
    ? items.slice(0, currentIndex).reduce((acc, item) => acc + item.sets, 0)
    : 0;
  const totalSetsAll = items.reduce((acc, item) => acc + item.sets, 0) || 1;
  const currentSetProgress = exerciseProgress + currentSet;
  const progress = Math.min((currentSetProgress / totalSetsAll) * 100, 100);

  // Elapsed time counter using Date.now() for accuracy
  useEffect(() => {
    if (totalItems > 0) {
      elapsedStartRef.current = Date.now();
      elapsedOffsetRef.current = 0;
      elapsedRef.current = setInterval(() => {
        const now = Date.now();
        const total = elapsedOffsetRef.current + Math.floor((now - elapsedStartRef.current) / 1000);
        setElapsedSeconds(total);
      }, 500); // Update twice per second for smoother display
    }
    return () => { if (elapsedRef.current) clearInterval(elapsedRef.current); };
  }, [totalItems]);

  // Rest timer using Date.now() for accuracy - no drift
  useEffect(() => {
    if (isResting && restTime > 0) {
      restEndTimeRef.current = Date.now() + restTime * 1000;
      timerRef.current = setInterval(() => {
        const remaining = Math.ceil((restEndTimeRef.current - Date.now()) / 1000);
        if (remaining <= 0) {
          if (timerRef.current) clearInterval(timerRef.current);
          setIsResting(false);
          setRestTime(0);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } else {
          setRestTime(remaining);
          // Gentle tick at 3, 2, 1 seconds
          if (remaining <= 3) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }
        }
      }, 250); // Check 4x per second for accurate countdown
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isResting]); // Only depend on isResting, not restTime — restTime is read via ref

  // Reset video error state when exercise changes
  useEffect(() => {
    setVideoError(false);
  }, [currentIndex]);

  // Auto-play/pause video with rest state and exercise changes
  useEffect(() => {
    if (!currentItem?.exercise?.videoUrl || videoError) return;
    if (isResting) {
      videoRef.current?.pauseAsync();
    } else {
      videoRef.current?.playAsync();
    }
  }, [isResting, currentIndex, currentItem?.exercise?.videoUrl, videoError]);

  const handleVideoError = useCallback(() => {
    setVideoError(true);
  }, []);

  const handleVideoStatus = useCallback((status: AVPlaybackStatus) => {
    if ('error' in status && status.error) {
      setVideoError(true);
    }
  }, []);

  const handleNext = useCallback(() => {
    if (!currentItem) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // More sets to do
    if (currentSet < currentItem.sets) {
      setCurrentSet((s) => s + 1);
      if (currentItem.restSeconds > 0) {
        setIsResting(true);
        setRestTime(currentItem.restSeconds);
      }
      return;
    }

    // Move to next exercise
    if (currentIndex < totalItems - 1) {
      setCurrentIndex((i) => i + 1);
      setCurrentSet(1);
      // Add rest between exercises if the current item has rest configured
      if (currentItem.restSeconds > 0) {
        setIsResting(true);
        setRestTime(currentItem.restSeconds);
      }
    } else {
      // Session complete - capture accurate elapsed time
      if (elapsedRef.current) clearInterval(elapsedRef.current);
      const finalElapsed = elapsedOffsetRef.current + Math.floor((Date.now() - elapsedStartRef.current) / 1000);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace({
        pathname: '/(tabs)/learn/session/[id]/complete',
        params: { id: id!, elapsed: String(finalElapsed) },
      });
    }
  }, [currentItem, currentSet, currentIndex, totalItems, id]);

  const handlePrevious = useCallback(() => {
    if (currentIndex === 0 && currentSet === 1) return; // Guard: already at the very start
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Cancel any active rest when going back
    if (isResting) {
      if (timerRef.current) clearInterval(timerRef.current);
      setIsResting(false);
      setRestTime(0);
    }

    if (currentSet > 1) {
      setCurrentSet((s) => s - 1);
    } else if (currentIndex > 0) {
      const prevItem = items[currentIndex - 1];
      setCurrentIndex((i) => i - 1);
      // Go to the last set of the previous exercise
      setCurrentSet(prevItem?.sets ?? 1);
    }
  }, [currentSet, currentIndex, isResting, items]);

  const skipRest = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsResting(false);
    setRestTime(0);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.centered}><ActivityIndicator color={colors.fg.primary} /></View>
      </SafeAreaView>
    );
  }

  if (!currentItem) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.centered}>
          <Text style={styles.errorText}>Session not found</Text>
          <Pressable onPress={() => router.back()}><Text style={styles.link}>Go back</Text></Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const isFirstPosition = currentIndex === 0 && currentSet === 1;
  const isLastPosition = currentIndex === totalItems - 1 && currentSet >= currentItem.sets;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Mini progress bar with exercise segment markers */}
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <View style={styles.progressSegments}>
          {items.map((item, i) => {
            const segStart = (items.slice(0, i).reduce((a, x) => a + x.sets, 0) / totalSetsAll) * 100;
            return i > 0 ? (
              <View key={i} style={[styles.progressSegmentMark, { left: `${segStart}%` }]} />
            ) : null;
          })}
        </View>
      </View>

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.closeButton}>
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={colors.fg.primary} strokeWidth={2}>
            <Path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </Pressable>
        <View style={styles.headerCenter}>
          <View style={[styles.sectionBadge, { backgroundColor: SECTION_COLORS[currentItem.section] || colors.cream10 }]}>
            <Text style={styles.sectionText}>{SECTION_LABELS[currentItem.section] || currentItem.section}</Text>
          </View>
          <Text style={styles.counter}>{currentIndex + 1} / {totalItems}</Text>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.elapsedTime}>{formatElapsed(elapsedSeconds)}</Text>
          <Pressable onPress={() => setShowDetails(!showDetails)} style={styles.infoButton}>
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={colors.fg.secondary} strokeWidth={1.5}>
              <Path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </Pressable>
        </View>
      </View>

      {/* Rest overlay */}
      {isResting && (
        <View style={styles.restOverlay}>
          <Text style={styles.restLabel}>Rest</Text>
          <Text style={styles.restTimer}>{restTime}</Text>
          <Text style={styles.restNext}>
            {currentSet <= currentItem.sets
              ? `Next: Set ${currentSet} of ${currentItem.sets}`
              : currentIndex < totalItems - 1
                ? `Next: ${items[currentIndex + 1]?.exercise?.name ?? 'Next exercise'}`
                : 'Almost done!'
            }
          </Text>
          <Button title="Skip Rest" variant="outline" onPress={skipRest} style={styles.skipButton} />
        </View>
      )}

      {/* Main content */}
      {!isResting && (
        <ScrollView style={styles.mainScroll} contentContainerStyle={styles.mainContent} showsVerticalScrollIndicator={false}>
          {/* Video with error fallback */}
          {currentItem.exercise.videoUrl && !videoError ? (
            <View style={styles.sessionVideoContainer}>
              <Video
                ref={videoRef}
                source={{ uri: currentItem.exercise.videoUrl }}
                posterSource={currentItem.exercise.imageUrl ? { uri: currentItem.exercise.imageUrl } : undefined}
                usePoster={!!currentItem.exercise.imageUrl}
                style={styles.sessionVideo}
                useNativeControls
                resizeMode={ResizeMode.CONTAIN}
                isLooping
                shouldPlay={!isResting}
                onError={handleVideoError}
                onPlaybackStatusUpdate={handleVideoStatus}
              />
            </View>
          ) : videoError && currentItem.exercise.imageUrl ? (
            <View style={styles.sessionVideoContainer}>
              <Image source={{ uri: currentItem.exercise.imageUrl }} style={styles.sessionVideo} resizeMode="cover" />
              <View style={styles.videoErrorOverlay}>
                <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={colors.fg.tertiary} strokeWidth={1.5}>
                  <Path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
                <Text style={styles.videoErrorText}>Video unavailable</Text>
              </View>
            </View>
          ) : videoError ? (
            <View style={[styles.sessionVideoContainer, styles.videoErrorFallback]}>
              <Svg width={32} height={32} viewBox="0 0 24 24" fill="none" stroke={colors.fg.tertiary} strokeWidth={1.5}>
                <Path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
              <Text style={styles.videoErrorText}>Video unavailable</Text>
            </View>
          ) : currentItem.exercise.imageUrl ? (
            <View style={styles.sessionVideoContainer}>
              <Image source={{ uri: currentItem.exercise.imageUrl }} style={styles.sessionVideo} resizeMode="cover" />
            </View>
          ) : null}

          <Text style={styles.exerciseName}>{currentItem.exercise.name}</Text>

          <View style={styles.setInfo}>
            <Text style={styles.setLabel}>Set {currentSet} of {currentItem.sets}</Text>
            {currentItem.reps ? <Text style={styles.repText}>{currentItem.reps} reps</Text> : null}
            {currentItem.duration ? <Text style={styles.repText}>{currentItem.duration}s</Text> : null}
            {currentItem.tempo ? <Text style={styles.tempoText}>Tempo: {currentItem.tempo}</Text> : null}
          </View>

          {currentItem.springSetting ? (
            <View style={styles.springRow}>
              <Text style={styles.springLabel}>Springs: </Text>
              <Text style={styles.springValue}>{currentItem.springSetting}</Text>
            </View>
          ) : null}

          {/* Cues */}
          {currentItem.showCues && currentItem.showCues.length > 0 && (
            <View style={styles.cuesContainer}>
              {currentItem.showCues.map((cue, i) => (
                <View key={i} style={styles.cueBox}>
                  <Text style={styles.cueNumber}>{i + 1}</Text>
                  <Text style={styles.cueText}>{cue}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Details section */}
          {showDetails && (
            <View style={styles.detailsSection}>
              <Text style={styles.detailsLabel}>About</Text>
              <Text style={styles.detailsText}>{currentItem.exercise.description}</Text>

              {currentItem.showMistakes && currentItem.showMistakes.length > 0 && (
                <>
                  <Text style={styles.detailsLabel}>Avoid</Text>
                  {currentItem.showMistakes.map((m, i) => (
                    <Text key={i} style={styles.mistakeText}>{'\u2022'} {m}</Text>
                  ))}
                </>
              )}
            </View>
          )}
        </ScrollView>
      )}

      {/* Footer buttons */}
      {!isResting && (
        <View style={styles.footer}>
          <Button
            title="Previous"
            variant="ghost"
            onPress={handlePrevious}
            disabled={isFirstPosition}
            style={styles.footerButton}
          />
          <Button
            title={isLastPosition ? 'Complete' : currentSet < currentItem.sets ? 'Next Set' : 'Next'}
            onPress={handleNext}
            style={{ ...styles.footerButton, flex: 2 }}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.primary },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  errorText: { fontSize: typography.sizes.base, color: colors.fg.tertiary, marginBottom: spacing.md },
  link: { fontSize: typography.sizes.base, color: colors.fg.primary, textDecorationLine: 'underline' },
  progressBarContainer: { position: 'relative' },
  progressBar: { height: 4, backgroundColor: colors.cream10 },
  progressFill: { height: '100%', backgroundColor: 'rgba(34, 197, 94, 0.8)', borderRadius: 2 },
  progressSegments: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  progressSegmentMark: { position: 'absolute', top: 0, width: 1, height: 4, backgroundColor: 'rgba(246, 237, 221, 0.2)' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  closeButton: { padding: spacing.xs },
  headerCenter: { alignItems: 'center' },
  sectionBadge: { paddingHorizontal: 16, paddingVertical: 5, borderRadius: radius.sm, marginBottom: 2 },
  sectionText: { fontSize: typography.sizes.xs, color: colors.fg.primary, textTransform: 'uppercase', fontWeight: typography.weights.bold, letterSpacing: 1 },
  counter: { fontSize: typography.sizes.xs, color: colors.fg.tertiary },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  elapsedTime: { fontSize: typography.sizes.xs, color: colors.fg.tertiary, fontVariant: ['tabular-nums'] },
  infoButton: { padding: spacing.xs },
  restOverlay: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  restLabel: { fontSize: typography.sizes.lg, color: colors.fg.tertiary, marginBottom: spacing.sm },
  restTimer: { fontSize: 80, fontWeight: typography.weights.bold, color: colors.fg.primary, marginBottom: spacing.md, fontVariant: ['tabular-nums'] },
  restNext: { fontSize: typography.sizes.base, color: colors.fg.secondary, marginBottom: spacing.xl, textAlign: 'center' },
  skipButton: { minWidth: 160 },
  mainScroll: { flex: 1 },
  mainContent: { padding: spacing.md, paddingTop: spacing.lg, paddingBottom: spacing.xl },
  sessionVideoContainer: { width: '100%', height: 200, borderRadius: radius.md, overflow: 'hidden', backgroundColor: colors.cream10, marginBottom: spacing.md },
  sessionVideo: { width: '100%', height: '100%' },
  videoErrorOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingVertical: 6, backgroundColor: 'rgba(0, 0, 0, 0.6)', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.xs },
  videoErrorFallback: { alignItems: 'center', justifyContent: 'center' },
  videoErrorText: { fontSize: typography.sizes.xs, color: colors.fg.tertiary },
  exerciseName: { fontSize: typography.sizes['2xl'], fontWeight: typography.weights.bold, color: colors.fg.primary, textAlign: 'center', marginBottom: spacing.lg },
  setInfo: { alignItems: 'center', marginBottom: spacing.lg },
  setLabel: { fontSize: typography.sizes.base, color: colors.fg.secondary, marginBottom: 4 },
  repText: { fontSize: typography.sizes.xl, fontWeight: typography.weights.semibold, color: colors.fg.primary },
  tempoText: { fontSize: typography.sizes.sm, color: colors.fg.tertiary, marginTop: 4 },
  springRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: spacing.lg },
  springLabel: { fontSize: typography.sizes.sm, color: colors.fg.tertiary },
  springValue: { fontSize: typography.sizes.sm, color: colors.fg.primary, fontWeight: typography.weights.medium },
  cuesContainer: { gap: spacing.xs, marginBottom: spacing.lg },
  cueBox: { flexDirection: 'row', gap: spacing.sm, backgroundColor: colors.cream10, borderRadius: radius.sm, padding: spacing.sm },
  cueNumber: { fontSize: typography.sizes.sm, fontWeight: typography.weights.bold, color: colors.fg.primary, width: 20 },
  cueText: { fontSize: typography.sizes.sm, color: colors.fg.secondary, flex: 1, lineHeight: 18 },
  detailsSection: { borderTopWidth: 1, borderTopColor: colors.border.default, paddingTop: spacing.md },
  detailsLabel: { fontSize: typography.sizes.sm, fontWeight: typography.weights.semibold, color: colors.fg.primary, marginBottom: 4, marginTop: spacing.sm },
  detailsText: { fontSize: typography.sizes.sm, color: colors.fg.secondary, lineHeight: 18 },
  mistakeText: { fontSize: typography.sizes.sm, color: 'rgba(239, 68, 68, 0.8)', lineHeight: 18 },
  footer: { flexDirection: 'row', gap: spacing.sm, padding: spacing.md },
  footerButton: { flex: 1 },
});
