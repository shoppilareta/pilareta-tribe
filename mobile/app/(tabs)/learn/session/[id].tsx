import { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import Svg, { Path } from 'react-native-svg';
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

export default function SessionPlayer() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [isResting, setIsResting] = useState(false);
  const [restTime, setRestTime] = useState(0);
  const [showDetails, setShowDetails] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['learn-session', id],
    queryFn: () => getSession(id!),
    enabled: !!id,
  });

  const items = data?.session?.items ?? [];
  const session = data?.session;
  const currentItem: PilatesSessionItem | undefined = items[currentIndex];
  const totalItems = items.length;
  const progress = totalItems > 0 ? ((currentIndex + 1) / totalItems) * 100 : 0;

  // Rest timer
  useEffect(() => {
    if (isResting && restTime > 0) {
      timerRef.current = setInterval(() => {
        setRestTime((prev) => {
          if (prev <= 1) {
            setIsResting(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isResting, restTime]);

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
    } else {
      // Session complete
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace(`/(tabs)/learn/session/${id}/complete`);
    }
  }, [currentItem, currentSet, currentIndex, totalItems, id]);

  const handlePrevious = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (currentSet > 1) {
      setCurrentSet((s) => s - 1);
    } else if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
      setCurrentSet(items[currentIndex - 1]?.sets ?? 1);
    }
  }, [currentSet, currentIndex, items]);

  const skipRest = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsResting(false);
    setRestTime(0);
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

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Progress bar */}
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${progress}%` }]} />
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
            <Text style={styles.sectionText}>{currentItem.section}</Text>
          </View>
          <Text style={styles.counter}>{currentIndex + 1} / {totalItems}</Text>
        </View>
        <Pressable onPress={() => setShowDetails(!showDetails)} style={styles.infoButton}>
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={colors.fg.secondary} strokeWidth={1.5}>
            <Path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </Pressable>
      </View>

      {/* Rest overlay */}
      {isResting && (
        <View style={styles.restOverlay}>
          <Text style={styles.restLabel}>Rest</Text>
          <Text style={styles.restTimer}>{restTime}</Text>
          <Text style={styles.restNext}>Next: Set {currentSet} of {currentItem.sets}</Text>
          <Button title="Skip Rest" variant="outline" onPress={skipRest} style={styles.skipButton} />
        </View>
      )}

      {/* Main content */}
      {!isResting && (
        <View style={styles.mainContent}>
          <Text style={styles.exerciseName}>{currentItem.exercise.name}</Text>

          <View style={styles.setInfo}>
            <Text style={styles.setLabel}>Set {currentSet} of {currentItem.sets}</Text>
            {currentItem.reps && <Text style={styles.repText}>{currentItem.reps} reps</Text>}
            {currentItem.duration && <Text style={styles.repText}>{currentItem.duration}s</Text>}
            {currentItem.tempo && <Text style={styles.tempoText}>Tempo: {currentItem.tempo}</Text>}
          </View>

          {currentItem.springSetting && (
            <View style={styles.springRow}>
              <Text style={styles.springLabel}>Springs: </Text>
              <Text style={styles.springValue}>{currentItem.springSetting}</Text>
            </View>
          )}

          {/* Cues */}
          {currentItem.showCues.length > 0 && (
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

              {currentItem.showMistakes.length > 0 && (
                <>
                  <Text style={styles.detailsLabel}>Avoid</Text>
                  {currentItem.showMistakes.map((m, i) => (
                    <Text key={i} style={styles.mistakeText}>{'\u2022'} {m}</Text>
                  ))}
                </>
              )}
            </View>
          )}
        </View>
      )}

      {/* Footer buttons */}
      {!isResting && (
        <View style={styles.footer}>
          <Button
            title="Previous"
            variant="ghost"
            onPress={handlePrevious}
            disabled={currentIndex === 0 && currentSet === 1}
            style={styles.footerButton}
          />
          <Button
            title={currentIndex === totalItems - 1 && currentSet >= currentItem.sets ? 'Complete' : currentSet < currentItem.sets ? 'Next Set' : 'Next'}
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
  progressBar: { height: 3, backgroundColor: colors.cream10 },
  progressFill: { height: '100%', backgroundColor: 'rgba(34, 197, 94, 0.8)' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  closeButton: { padding: spacing.xs },
  headerCenter: { alignItems: 'center' },
  sectionBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: radius.xs, marginBottom: 2 },
  sectionText: { fontSize: 11, color: colors.fg.primary, textTransform: 'uppercase', fontWeight: typography.weights.medium, letterSpacing: 0.5 },
  counter: { fontSize: typography.sizes.xs, color: colors.fg.tertiary },
  infoButton: { padding: spacing.xs },
  restOverlay: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  restLabel: { fontSize: typography.sizes.lg, color: colors.fg.tertiary, marginBottom: spacing.sm },
  restTimer: { fontSize: 80, fontWeight: typography.weights.bold, color: colors.fg.primary, marginBottom: spacing.md },
  restNext: { fontSize: typography.sizes.base, color: colors.fg.secondary, marginBottom: spacing.xl },
  skipButton: { minWidth: 160 },
  mainContent: { flex: 1, padding: spacing.md, paddingTop: spacing.xl },
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
