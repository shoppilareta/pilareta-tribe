import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import * as SecureStore from 'expo-secure-store';
import Svg, { Path } from 'react-native-svg';
import { VideoView, useVideoPlayer } from 'expo-video';
import { colors, typography, spacing, radius } from '@/theme';
import { Card, Badge } from '@/components/ui';
import { getExercise, getExerciseCompletionStats } from '@/api/learn';
import { API_BASE } from '@/api/client';

function resolveUrl(url: string | null): string | null {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${API_BASE}${url}`;
}

/** Format snake_case to Title Case: "erector_spinae" → "Erector Spinae" */
function formatLabel(s: string): string {
  return s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

const FAVORITES_KEY = 'pilareta_favorite_exercises';

async function getFavorites(): Promise<string[]> {
  try {
    const val = await SecureStore.getItemAsync(FAVORITES_KEY);
    return val ? JSON.parse(val) : [];
  } catch {
    return [];
  }
}

async function setFavorites(slugs: string[]): Promise<void> {
  await SecureStore.setItemAsync(FAVORITES_KEY, JSON.stringify(slugs));
}

// Color-coded difficulty: green = beginner, amber = intermediate, red = advanced
const DIFFICULTY_BADGE_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  beginner: { bg: 'rgba(34, 197, 94, 0.15)', border: 'rgba(34, 197, 94, 0.4)', text: 'rgba(34, 197, 94, 0.9)' },
  intermediate: { bg: 'rgba(234, 179, 8, 0.15)', border: 'rgba(234, 179, 8, 0.4)', text: 'rgba(234, 179, 8, 0.9)' },
  advanced: { bg: 'rgba(239, 68, 68, 0.15)', border: 'rgba(239, 68, 68, 0.4)', text: 'rgba(239, 68, 68, 0.9)' },
};

function CollapsibleSection({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <View style={sectionStyles.container}>
      <Pressable onPress={() => setOpen(!open)} style={sectionStyles.header}>
        <Text style={sectionStyles.title}>{title}</Text>
        <Text style={sectionStyles.chevron}>{open ? '\u25B2' : '\u25BC'}</Text>
      </Pressable>
      {open && <View style={sectionStyles.content}>{children}</View>}
    </View>
  );
}

const sectionStyles = StyleSheet.create({
  container: { marginBottom: spacing.sm },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.sm },
  title: { fontSize: typography.sizes.base, fontWeight: typography.weights.semibold, color: colors.fg.primary },
  chevron: { fontSize: 12, color: colors.fg.tertiary },
  content: { paddingBottom: spacing.sm },
});

export default function ExerciseDetail() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const [isFavorite, setIsFavorite] = useState(false);
  const [videoError, setVideoError] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['learn-exercise', slug],
    queryFn: () => getExercise(slug!),
    enabled: !!slug,
  });

  // 3A: Exercise completion stats - graceful error handling
  const { data: statsData } = useQuery({
    queryKey: ['exercise-completion-stats', slug],
    queryFn: () => getExerciseCompletionStats(slug!),
    enabled: !!slug,
    retry: 1,
    // Silently fail - stats are non-critical
  });

  // Load favorite state
  useEffect(() => {
    if (!slug) return;
    getFavorites().then((favs) => setIsFavorite(favs.includes(slug)));
  }, [slug]);

  const toggleFavorite = useCallback(async () => {
    if (!slug) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const favs = await getFavorites();
    const next = isFavorite ? favs.filter((s) => s !== slug) : [...favs, slug];
    await setFavorites(next);
    setIsFavorite(!isFavorite);
  }, [slug, isFavorite]);

  const videoUri = data?.exercise?.videoUrl ? resolveUrl(data.exercise.videoUrl) : null;
  const player = useVideoPlayer(videoUri || null, (p) => {
    p.loop = true;
    p.muted = false;
  });

  useEffect(() => {
    if (!player) return;
    const sub = player.addListener('statusChange', ({ status, error }) => {
      if (status === 'error' || error) setVideoError(true);
    });
    return () => sub.remove();
  }, [player]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.centered}><ActivityIndicator color={colors.fg.primary} /></View>
      </SafeAreaView>
    );
  }

  const ex = data?.exercise;
  if (!ex) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.centered}>
          <Text style={styles.errorText}>Exercise not found</Text>
          <Pressable onPress={() => router.back()}><Text style={styles.link}>Go back</Text></Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // Safe access with null checks for all optional arrays/objects
  const cues = ex.cues ?? [];
  const modifications = ex.modifications;
  const commonMistakes = ex.commonMistakes ?? [];
  const contraindications = ex.contraindications ?? [];
  const setupSteps = ex.setupSteps ?? [];
  const executionSteps = ex.executionSteps ?? [];
  const primaryMuscles = ex.primaryMuscles ?? [];
  const secondaryMuscles = ex.secondaryMuscles ?? [];

  const difficultyColors = DIFFICULTY_BADGE_COLORS[ex.difficulty] || DIFFICULTY_BADGE_COLORS.beginner;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={colors.fg.primary} strokeWidth={2}>
            <Path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>{ex.name}</Text>
        <Pressable onPress={toggleFavorite} style={styles.favoriteButton}>
          <Svg width={22} height={22} viewBox="0 0 24 24" fill={isFavorite ? 'rgba(239, 68, 68, 0.9)' : 'none'} stroke={isFavorite ? 'rgba(239, 68, 68, 0.9)' : colors.fg.tertiary} strokeWidth={2}>
            <Path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </Pressable>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Video with error fallback / Hero image */}
        {ex.videoUrl && !videoError ? (
          <View style={styles.videoContainer}>
            <VideoView
              player={player}
              style={styles.video}
              contentFit="contain"
              nativeControls
              allowsFullscreen
            />
          </View>
        ) : videoError && ex.imageUrl ? (
          <View style={styles.videoContainer}>
            <Image source={{ uri: resolveUrl(ex.imageUrl)! }} style={styles.video} resizeMode="cover" />
            <View style={styles.videoErrorOverlay}>
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={colors.fg.tertiary} strokeWidth={1.5}>
                <Path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
              <Text style={styles.videoErrorText}>Video unavailable</Text>
            </View>
          </View>
        ) : videoError ? (
          <View style={[styles.videoContainer, styles.videoErrorFallback]}>
            <Svg width={32} height={32} viewBox="0 0 24 24" fill="none" stroke={colors.fg.tertiary} strokeWidth={1.5}>
              <Path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
            <Text style={styles.videoErrorText}>Video unavailable</Text>
          </View>
        ) : ex.imageUrl ? (
          <Image source={{ uri: resolveUrl(ex.imageUrl)! }} style={styles.heroImage} resizeMode="cover" />
        ) : null}

        {/* Color-coded difficulty badge */}
        <View style={styles.badgeRow}>
          <View style={[styles.diffBadge, { backgroundColor: difficultyColors.bg, borderColor: difficultyColors.border, borderWidth: 1 }]}>
            <Text style={[styles.diffBadgeText, { color: difficultyColors.text }]}>{ex.difficulty}</Text>
          </View>
          {ex.equipment ? <Badge text={ex.equipment} variant="accent" /> : null}
        </View>

        <Text style={styles.description}>{ex.description}</Text>

        {/* 3A: Completion stats - with safe access */}
        {statsData && typeof statsData.completionCount === 'number' && statsData.completionCount > 0 && (
          <View style={styles.completionCard}>
            <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="rgba(34, 197, 94, 0.8)" strokeWidth={2}>
              <Path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
            <Text style={styles.completionText}>
              You've done this exercise {statsData.completionCount} time{statsData.completionCount !== 1 ? 's' : ''}
              {statsData.lastCompletedAt && (
                ` \u00B7 Last: ${new Date(statsData.lastCompletedAt).toLocaleDateString()}`
              )}
            </Text>
          </View>
        )}

        {/* Quick info grid */}
        <View style={styles.infoGrid}>
          {ex.defaultSets > 0 && (
            <View style={styles.infoItem}>
              <Text style={styles.infoValue}>{ex.defaultSets}</Text>
              <Text style={styles.infoLabel}>Sets</Text>
            </View>
          )}
          {ex.defaultReps != null && ex.defaultReps > 0 && (
            <View style={styles.infoItem}>
              <Text style={styles.infoValue}>{ex.defaultReps}</Text>
              <Text style={styles.infoLabel}>Reps</Text>
            </View>
          )}
          {ex.defaultDuration != null && ex.defaultDuration > 0 && (
            <View style={styles.infoItem}>
              <Text style={styles.infoValue}>{ex.defaultDuration}s</Text>
              <Text style={styles.infoLabel}>Duration</Text>
            </View>
          )}
          {ex.defaultTempo ? (
            <View style={styles.infoItem}>
              <Text style={styles.infoValue}>{ex.defaultTempo}</Text>
              <Text style={styles.infoLabel}>Tempo</Text>
            </View>
          ) : null}
          {ex.rpeTarget != null && ex.rpeTarget > 0 && (
            <View style={styles.infoItem}>
              <Text style={styles.infoValue}>{ex.rpeTarget}</Text>
              <Text style={styles.infoLabel}>RPE</Text>
            </View>
          )}
          {ex.springSuggestion ? (
            <View style={styles.infoItem}>
              <Text style={styles.infoValue} numberOfLines={1}>{ex.springSuggestion}</Text>
              <Text style={styles.infoLabel}>Springs</Text>
            </View>
          ) : null}
        </View>

        {/* Collapsible sections */}
        {setupSteps.length > 0 && (
          <CollapsibleSection title="Setup" defaultOpen>
            {setupSteps.map((step, i) => (
              <Text key={i} style={styles.stepText}>{i + 1}. {step}</Text>
            ))}
          </CollapsibleSection>
        )}

        {executionSteps.length > 0 && (
          <CollapsibleSection title="Execution" defaultOpen>
            {executionSteps.map((step, i) => (
              <Text key={i} style={styles.stepText}>{i + 1}. {step}</Text>
            ))}
          </CollapsibleSection>
        )}

        {cues.length > 0 && (
          <CollapsibleSection title="Key Cues">
            {cues.map((cue, i) => (
              <View key={i} style={styles.cueBox}>
                <Text style={styles.cueNumber}>{i + 1}</Text>
                <Text style={styles.cueText}>{cue}</Text>
              </View>
            ))}
          </CollapsibleSection>
        )}

        {commonMistakes.length > 0 && (
          <CollapsibleSection title="Common Mistakes">
            {commonMistakes.map((m, i) => (
              <Text key={i} style={styles.mistakeText}>{'\u2022'} {m}</Text>
            ))}
          </CollapsibleSection>
        )}

        {modifications && (modifications.easier?.length > 0 || modifications.harder?.length > 0) && (
          <CollapsibleSection title="Modifications">
            {modifications.easier && modifications.easier.length > 0 && (
              <>
                <Text style={styles.modLabel}>Easier:</Text>
                {modifications.easier.map((m, i) => (
                  <Text key={i} style={styles.stepText}>{'\u2022'} {m}</Text>
                ))}
              </>
            )}
            {modifications.harder && modifications.harder.length > 0 && (
              <>
                <Text style={[styles.modLabel, { marginTop: spacing.sm }]}>Harder:</Text>
                {modifications.harder.map((m, i) => (
                  <Text key={i} style={styles.stepText}>{'\u2022'} {m}</Text>
                ))}
              </>
            )}
          </CollapsibleSection>
        )}

        {(primaryMuscles.length > 0 || secondaryMuscles.length > 0) && (
          <CollapsibleSection title="Muscles Worked">
            {primaryMuscles.length > 0 && (
              <View style={styles.muscleRow}>
                <Text style={styles.muscleLabel}>Primary: </Text>
                <Text style={styles.muscleValue}>{primaryMuscles.map(formatLabel).join(', ')}</Text>
              </View>
            )}
            {secondaryMuscles.length > 0 && (
              <View style={styles.muscleRow}>
                <Text style={styles.muscleLabel}>Secondary: </Text>
                <Text style={styles.muscleSecondary}>{secondaryMuscles.map(formatLabel).join(', ')}</Text>
              </View>
            )}
          </CollapsibleSection>
        )}

        {(ex.safetyNotes || contraindications.length > 0) && (
          <CollapsibleSection title="Safety">
            {ex.safetyNotes ? <Text style={styles.safetyText}>{ex.safetyNotes}</Text> : null}
            {contraindications.map((c, i) => (
              <Text key={i} style={styles.mistakeText}>{'\u26A0\uFE0F'} {formatLabel(c)}</Text>
            ))}
          </CollapsibleSection>
        )}
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
  favoriteButton: { padding: spacing.xs },
  scroll: { flex: 1 },
  content: { padding: spacing.md, paddingBottom: 100 },
  videoContainer: { width: '100%', aspectRatio: 16 / 9, borderRadius: radius.md, overflow: 'hidden', backgroundColor: colors.cream10, marginBottom: spacing.md },
  video: { width: '100%', height: '100%' },
  videoErrorOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingVertical: 6, backgroundColor: 'rgba(0, 0, 0, 0.6)', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.xs },
  videoErrorFallback: { alignItems: 'center', justifyContent: 'center' },
  videoErrorText: { fontSize: typography.sizes.xs, color: colors.fg.tertiary },
  heroImage: { width: '100%', aspectRatio: 16 / 9, borderRadius: radius.md, marginBottom: spacing.md },
  badgeRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  diffBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: radius.xs },
  diffBadgeText: { fontSize: typography.sizes.sm, textTransform: 'capitalize', fontWeight: typography.weights.semibold },
  description: { fontSize: typography.sizes.base, color: colors.fg.secondary, lineHeight: 22, marginBottom: spacing.md },
  completionCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: 'rgba(34, 197, 94, 0.08)', borderRadius: radius.sm, padding: spacing.sm, marginBottom: spacing.lg },
  completionText: { fontSize: typography.sizes.sm, color: colors.fg.secondary, flex: 1 },
  infoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.lg },
  infoItem: { backgroundColor: colors.bg.card, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border.default, padding: spacing.md, alignItems: 'center', minWidth: 70 },
  infoValue: { fontSize: typography.sizes.base, fontWeight: typography.weights.semibold, color: colors.fg.primary, marginBottom: 2 },
  infoLabel: { fontSize: 10, color: colors.fg.tertiary, textTransform: 'uppercase' },
  stepText: { fontSize: typography.sizes.sm, color: colors.fg.secondary, lineHeight: 20, marginBottom: 4 },
  cueBox: { flexDirection: 'row', gap: spacing.sm, backgroundColor: colors.cream10, borderRadius: radius.sm, padding: spacing.sm, marginBottom: spacing.xs },
  cueNumber: { fontSize: typography.sizes.sm, fontWeight: typography.weights.bold, color: colors.fg.primary, width: 20 },
  cueText: { fontSize: typography.sizes.sm, color: colors.fg.secondary, flex: 1, lineHeight: 18 },
  mistakeText: { fontSize: typography.sizes.sm, color: 'rgba(239, 68, 68, 0.8)', lineHeight: 20, marginBottom: 4 },
  modLabel: { fontSize: typography.sizes.sm, fontWeight: typography.weights.semibold, color: colors.fg.primary, marginBottom: 4 },
  muscleRow: { flexDirection: 'row', marginBottom: 4 },
  muscleLabel: { fontSize: typography.sizes.sm, color: colors.fg.tertiary },
  muscleValue: { fontSize: typography.sizes.sm, color: colors.fg.primary, fontWeight: typography.weights.medium, flex: 1 },
  muscleSecondary: { fontSize: typography.sizes.sm, color: colors.fg.tertiary, flex: 1 },
  safetyText: { fontSize: typography.sizes.sm, color: colors.fg.secondary, lineHeight: 20, marginBottom: spacing.sm },
});
