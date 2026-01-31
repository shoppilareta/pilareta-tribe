import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import { colors, typography, spacing, radius } from '@/theme';
import { Card } from '@/components/ui';
import { getExercises, getPrograms } from '@/api/learn';
import { ExerciseCard } from '@/components/learn/ExerciseCard';
import { ProgramCard } from '@/components/learn/ProgramCard';

type Tab = 'exercises' | 'programs';

const DIFFICULTY_ORDER = ['beginner', 'intermediate', 'advanced'];
const FOCUS_AREAS = ['core', 'glutes', 'legs', 'arms', 'back', 'posture', 'mobility'];

export default function LearnScreen() {
  const [tab, setTab] = useState<Tab>('exercises');
  const [difficultyFilter, setDifficultyFilter] = useState<string | null>(null);
  const [focusFilter, setFocusFilter] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const { data: exerciseData, isLoading: loadingExercises } = useQuery({
    queryKey: ['learn-exercises'],
    queryFn: getExercises,
    staleTime: 1000 * 60 * 10,
  });

  const { data: programData, isLoading: loadingPrograms } = useQuery({
    queryKey: ['learn-programs'],
    queryFn: getPrograms,
    staleTime: 1000 * 60 * 10,
  });

  const exercises = exerciseData?.exercises ?? [];
  const programs = programData?.programs ?? [];

  const filteredExercises = exercises.filter((ex) => {
    if (difficultyFilter && ex.difficulty !== difficultyFilter) return false;
    if (focusFilter && !ex.focusAreas.includes(focusFilter)) return false;
    if (search) {
      const q = search.toLowerCase();
      return ex.name.toLowerCase().includes(q) || ex.description.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Learn</Text>
          <Pressable onPress={() => router.push('/(tabs)/learn/build')} style={styles.buildButton}>
            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={colors.bg.primary} strokeWidth={2}>
              <Path d="M12 5v14M5 12h14" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
            <Text style={styles.buildButtonText}>Build Session</Text>
          </Pressable>
        </View>

        {/* Tab switcher */}
        <View style={styles.tabRow}>
          <Pressable
            onPress={() => setTab('exercises')}
            style={[styles.tab, tab === 'exercises' && styles.tabActive]}
          >
            <Text style={[styles.tabText, tab === 'exercises' && styles.tabTextActive]}>
              Exercises ({exercises.length})
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setTab('programs')}
            style={[styles.tab, tab === 'programs' && styles.tabActive]}
          >
            <Text style={[styles.tabText, tab === 'programs' && styles.tabTextActive]}>
              Programs ({programs.length})
            </Text>
          </Pressable>
        </View>

        {tab === 'exercises' && (
          <>
            {/* Difficulty filter */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
              <View style={styles.filterRow}>
                <Pressable
                  onPress={() => setDifficultyFilter(null)}
                  style={[styles.filterChip, !difficultyFilter && styles.filterChipActive]}
                >
                  <Text style={[styles.filterChipText, !difficultyFilter && styles.filterChipTextActive]}>All</Text>
                </Pressable>
                {DIFFICULTY_ORDER.map((d) => (
                  <Pressable
                    key={d}
                    onPress={() => setDifficultyFilter(difficultyFilter === d ? null : d)}
                    style={[styles.filterChip, difficultyFilter === d && styles.filterChipActive]}
                  >
                    <Text style={[styles.filterChipText, difficultyFilter === d && styles.filterChipTextActive]}>
                      {d.charAt(0).toUpperCase() + d.slice(1)}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>

            {/* Focus area filter */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
              <View style={styles.filterRow}>
                {FOCUS_AREAS.map((f) => (
                  <Pressable
                    key={f}
                    onPress={() => setFocusFilter(focusFilter === f ? null : f)}
                    style={[styles.filterChip, focusFilter === f && styles.filterChipActive]}
                  >
                    <Text style={[styles.filterChipText, focusFilter === f && styles.filterChipTextActive]}>
                      {f.charAt(0).toUpperCase() + f.slice(1)}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>

            {loadingExercises ? (
              <View style={styles.loading}><ActivityIndicator color={colors.fg.primary} /></View>
            ) : filteredExercises.length === 0 ? (
              <View style={styles.empty}>
                <Text style={styles.emptyText}>No exercises match your filters</Text>
                <Pressable onPress={() => { setDifficultyFilter(null); setFocusFilter(null); }}>
                  <Text style={styles.clearFilters}>Clear filters</Text>
                </Pressable>
              </View>
            ) : (
              filteredExercises.map((ex) => (
                <ExerciseCard key={ex.id} exercise={ex} />
              ))
            )}
          </>
        )}

        {tab === 'programs' && (
          <>
            {loadingPrograms ? (
              <View style={styles.loading}><ActivityIndicator color={colors.fg.primary} /></View>
            ) : programs.length === 0 ? (
              <View style={styles.empty}>
                <Text style={styles.emptyText}>No programs available yet</Text>
              </View>
            ) : (
              programs.map((prog) => (
                <ProgramCard key={prog.id} program={prog} />
              ))
            )}
          </>
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
  scroll: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.fg.primary,
  },
  buildButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.button.primaryBg,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.sm,
  },
  buildButtonText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.button.primaryText,
  },
  tabRow: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    borderRadius: radius.sm,
    backgroundColor: colors.cream10,
    padding: 3,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: radius.xs,
  },
  tabActive: {
    backgroundColor: colors.fg.primary,
  },
  tabText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.fg.tertiary,
  },
  tabTextActive: {
    color: colors.bg.primary,
  },
  filterScroll: {
    marginBottom: spacing.sm,
    marginHorizontal: -spacing.md,
    paddingHorizontal: spacing.md,
  },
  filterRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.sm,
    backgroundColor: colors.bg.card,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  filterChipActive: {
    backgroundColor: colors.fg.primary,
    borderColor: colors.fg.primary,
  },
  filterChipText: {
    fontSize: typography.sizes.xs,
    color: colors.fg.secondary,
  },
  filterChipTextActive: {
    color: colors.bg.primary,
  },
  loading: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  empty: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: typography.sizes.base,
    color: colors.fg.tertiary,
    marginBottom: spacing.sm,
  },
  clearFilters: {
    fontSize: typography.sizes.sm,
    color: colors.fg.primary,
    textDecorationLine: 'underline',
  },
});
