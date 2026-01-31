import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import Svg, { Path } from 'react-native-svg';
import { colors, typography, spacing, radius } from '@/theme';
import { Card, Badge } from '@/components/ui';
import { getExercise } from '@/api/learn';

const SECTION_COLORS: Record<string, string> = {
  beginner: 'rgba(34, 197, 94, 0.3)',
  intermediate: 'rgba(234, 179, 8, 0.3)',
  advanced: 'rgba(239, 68, 68, 0.3)',
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

  const { data, isLoading } = useQuery({
    queryKey: ['learn-exercise', slug],
    queryFn: () => getExercise(slug!),
    enabled: !!slug,
  });

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

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={colors.fg.primary} strokeWidth={2}>
            <Path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>{ex.name}</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Badges */}
        <View style={styles.badgeRow}>
          <View style={[styles.diffBadge, { backgroundColor: SECTION_COLORS[ex.difficulty] || colors.cream10 }]}>
            <Text style={styles.diffBadgeText}>{ex.difficulty}</Text>
          </View>
          <Badge text={ex.equipment} variant="accent" />
        </View>

        <Text style={styles.description}>{ex.description}</Text>

        {/* Quick info grid */}
        <View style={styles.infoGrid}>
          {ex.defaultSets > 0 && (
            <View style={styles.infoItem}>
              <Text style={styles.infoValue}>{ex.defaultSets}</Text>
              <Text style={styles.infoLabel}>Sets</Text>
            </View>
          )}
          {ex.defaultReps && (
            <View style={styles.infoItem}>
              <Text style={styles.infoValue}>{ex.defaultReps}</Text>
              <Text style={styles.infoLabel}>Reps</Text>
            </View>
          )}
          {ex.defaultDuration && (
            <View style={styles.infoItem}>
              <Text style={styles.infoValue}>{ex.defaultDuration}s</Text>
              <Text style={styles.infoLabel}>Duration</Text>
            </View>
          )}
          {ex.defaultTempo && (
            <View style={styles.infoItem}>
              <Text style={styles.infoValue}>{ex.defaultTempo}</Text>
              <Text style={styles.infoLabel}>Tempo</Text>
            </View>
          )}
          <View style={styles.infoItem}>
            <Text style={styles.infoValue}>{ex.rpeTarget}</Text>
            <Text style={styles.infoLabel}>RPE</Text>
          </View>
          {ex.springSuggestion && (
            <View style={styles.infoItem}>
              <Text style={styles.infoValue} numberOfLines={1}>{ex.springSuggestion}</Text>
              <Text style={styles.infoLabel}>Springs</Text>
            </View>
          )}
        </View>

        {/* Collapsible sections */}
        {ex.setupSteps.length > 0 && (
          <CollapsibleSection title="Setup" defaultOpen>
            {ex.setupSteps.map((step, i) => (
              <Text key={i} style={styles.stepText}>{i + 1}. {step}</Text>
            ))}
          </CollapsibleSection>
        )}

        {ex.executionSteps.length > 0 && (
          <CollapsibleSection title="Execution" defaultOpen>
            {ex.executionSteps.map((step, i) => (
              <Text key={i} style={styles.stepText}>{i + 1}. {step}</Text>
            ))}
          </CollapsibleSection>
        )}

        {ex.cues.length > 0 && (
          <CollapsibleSection title="Key Cues">
            {ex.cues.map((cue, i) => (
              <View key={i} style={styles.cueBox}>
                <Text style={styles.cueNumber}>{i + 1}</Text>
                <Text style={styles.cueText}>{cue}</Text>
              </View>
            ))}
          </CollapsibleSection>
        )}

        {ex.commonMistakes.length > 0 && (
          <CollapsibleSection title="Common Mistakes">
            {ex.commonMistakes.map((m, i) => (
              <Text key={i} style={styles.mistakeText}>{'\u2022'} {m}</Text>
            ))}
          </CollapsibleSection>
        )}

        {ex.modifications && (
          <CollapsibleSection title="Modifications">
            {ex.modifications.easier.length > 0 && (
              <>
                <Text style={styles.modLabel}>Easier:</Text>
                {ex.modifications.easier.map((m, i) => (
                  <Text key={i} style={styles.stepText}>{'\u2022'} {m}</Text>
                ))}
              </>
            )}
            {ex.modifications.harder.length > 0 && (
              <>
                <Text style={[styles.modLabel, { marginTop: spacing.sm }]}>Harder:</Text>
                {ex.modifications.harder.map((m, i) => (
                  <Text key={i} style={styles.stepText}>{'\u2022'} {m}</Text>
                ))}
              </>
            )}
          </CollapsibleSection>
        )}

        {(ex.primaryMuscles.length > 0 || ex.secondaryMuscles.length > 0) && (
          <CollapsibleSection title="Muscles Worked">
            {ex.primaryMuscles.length > 0 && (
              <View style={styles.muscleRow}>
                <Text style={styles.muscleLabel}>Primary: </Text>
                <Text style={styles.muscleValue}>{ex.primaryMuscles.join(', ')}</Text>
              </View>
            )}
            {ex.secondaryMuscles.length > 0 && (
              <View style={styles.muscleRow}>
                <Text style={styles.muscleLabel}>Secondary: </Text>
                <Text style={styles.muscleSecondary}>{ex.secondaryMuscles.join(', ')}</Text>
              </View>
            )}
          </CollapsibleSection>
        )}

        {(ex.safetyNotes || ex.contraindications.length > 0) && (
          <CollapsibleSection title="Safety">
            {ex.safetyNotes && <Text style={styles.safetyText}>{ex.safetyNotes}</Text>}
            {ex.contraindications.map((c, i) => (
              <Text key={i} style={styles.mistakeText}>{'\u26A0\uFE0F'} {c}</Text>
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
  scroll: { flex: 1 },
  content: { padding: spacing.md, paddingBottom: 100 },
  badgeRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  diffBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: radius.xs },
  diffBadgeText: { fontSize: typography.sizes.sm, color: colors.fg.primary, textTransform: 'capitalize', fontWeight: typography.weights.medium },
  description: { fontSize: typography.sizes.base, color: colors.fg.secondary, lineHeight: 22, marginBottom: spacing.lg },
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
