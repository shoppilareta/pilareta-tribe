import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, TextInput, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { router, useFocusEffect } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import { colors, typography, spacing, radius } from '@/theme';
import { Card, LearnSkeleton } from '@/components/ui';
import { getExercises, getPrograms } from '@/api/learn';
import { ExerciseCard } from '@/components/learn/ExerciseCard';
import { ProgramCard } from '@/components/learn/ProgramCard';
import { getSavedSessions, removeSavedSession, type SavedSession } from '@/utils/savedSessions';

type Tab = 'exercises' | 'programs';

const DIFFICULTY_ORDER = ['beginner', 'intermediate', 'advanced'];
const FOCUS_AREAS = ['core', 'glutes', 'legs', 'arms', 'back', 'posture', 'mobility'];

export default function LearnScreen() {
  const [tab, setTab] = useState<Tab>('exercises');
  const [difficultyFilter, setDifficultyFilter] = useState<string | null>(null);
  const [focusFilter, setFocusFilter] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [savedSessions, setSavedSessions] = useState<SavedSession[]>([]);

  const { data: exerciseData, isLoading: loadingExercises, isRefetching: refetchingExercises, refetch: refetchExercises } = useQuery({
    queryKey: ['learn-exercises'],
    queryFn: getExercises,
    staleTime: 1000 * 60 * 10,
  });

  const { data: programData, isLoading: loadingPrograms, isRefetching: refetchingPrograms, refetch: refetchPrograms } = useQuery({
    queryKey: ['learn-programs'],
    queryFn: getPrograms,
    staleTime: 1000 * 60 * 10,
  });

  // Reload saved sessions when screen focuses; clear search on blur
  useFocusEffect(
    useCallback(() => {
      getSavedSessions().then(setSavedSessions);
      return () => {
        setSearch('');
      };
    }, [])
  );

  const exercises = exerciseData?.exercises ?? [];
  const programs = programData?.programs ?? [];

  // Normalize search: lowercase and strip special characters so names like
  // "Roll-Up" or "Teaser (Single Leg)" can be found with plain queries.
  const searchLower = search.toLowerCase();
  const searchNormalized = searchLower.replace(/[^a-z0-9\s]/g, '');

  const matchesSearch = (text: string): boolean => {
    if (!search) return true;
    const lower = text.toLowerCase();
    // Try exact substring first, then normalized (no special chars) match
    return lower.includes(searchLower) || lower.replace(/[^a-z0-9\s]/g, '').includes(searchNormalized);
  };

  const filteredExercises = exercises.filter((ex) => {
    if (difficultyFilter && ex.difficulty !== difficultyFilter) return false;
    if (focusFilter && !ex.focusAreas.includes(focusFilter)) return false;
    if (search) {
      return matchesSearch(ex.name) || matchesSearch(ex.description);
    }
    return true;
  });

  // 2C: Search also filters programs
  const filteredPrograms = search
    ? programs.filter((p) =>
        matchesSearch(p.name) ||
        matchesSearch(p.description) ||
        p.focusAreas.some((a) => matchesSearch(a))
      )
    : programs;

  const handleRemoveSaved = async (sessionId: string) => {
    const updated = await removeSavedSession(sessionId);
    setSavedSessions(updated);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refetchingExercises || refetchingPrograms}
            onRefresh={() => { refetchExercises(); refetchPrograms(); }}
            tintColor={colors.fg.primary}
            colors={[colors.fg.primary]}
          />
        }
      >
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

        {/* Search bar */}
        <View style={styles.searchContainer}>
          <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={colors.fg.tertiary} strokeWidth={2} style={styles.searchIcon}>
            <Path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
          <TextInput
            style={styles.searchInput}
            placeholder="Search exercises & programs..."
            placeholderTextColor={colors.fg.tertiary}
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
            clearButtonMode="while-editing"
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch('')} style={styles.searchClear}>
              <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={colors.fg.tertiary} strokeWidth={2}>
                <Path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            </Pressable>
          )}
        </View>

        {/* Saved Sessions carousel */}
        {savedSessions.length > 0 && !search && (
          <View style={styles.savedSection}>
            <Text style={styles.savedTitle}>Saved Sessions</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.savedScroll}>
              <View style={styles.savedRow}>
                {savedSessions.map((ss) => (
                  <Pressable
                    key={ss.sessionId}
                    onPress={() => router.push(`/(tabs)/learn/session/${ss.sessionId}`)}
                    style={styles.savedCard}
                  >
                    <Text style={styles.savedName} numberOfLines={2}>{ss.name}</Text>
                    <Text style={styles.savedDate}>
                      {new Date(ss.createdAt).toLocaleDateString()}
                    </Text>
                    <Pressable onPress={() => handleRemoveSaved(ss.sessionId)} style={styles.savedRemove} hitSlop={8}>
                      <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={colors.fg.tertiary} strokeWidth={2}>
                        <Path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                      </Svg>
                    </Pressable>
                  </Pressable>
                ))}
              </View>
            </ScrollView>
          </View>
        )}

        {/* Search results: matching programs section (2C) */}
        {search && filteredPrograms.length > 0 && (
          <View style={styles.searchResultsSection}>
            <Text style={styles.searchResultsTitle}>Programs ({filteredPrograms.length})</Text>
            {filteredPrograms.map((prog) => (
              <ProgramCard key={prog.id} program={prog} />
            ))}
          </View>
        )}

        {search && filteredExercises.length > 0 && (
          <View style={styles.searchResultsSection}>
            <Text style={styles.searchResultsTitle}>Exercises ({filteredExercises.length})</Text>
            {filteredExercises.map((ex) => (
              <ExerciseCard key={ex.id} exercise={ex} />
            ))}
          </View>
        )}

        {search && filteredExercises.length === 0 && filteredPrograms.length === 0 && (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No results for "{search}"</Text>
            <Pressable onPress={() => setSearch('')}>
              <Text style={styles.clearFilters}>Clear search</Text>
            </Pressable>
          </View>
        )}

        {/* Tab switcher (hidden during search) */}
        {!search && (
          <>
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
                  <LearnSkeleton />
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
                  <LearnSkeleton />
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
    marginBottom: spacing.md,
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bg.card,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.md,
    height: 42,
  },
  searchIcon: {
    marginRight: spacing.xs,
  },
  searchInput: {
    flex: 1,
    fontSize: typography.sizes.sm,
    color: colors.fg.primary,
    paddingVertical: 0,
  },
  searchClear: {
    padding: spacing.xs,
  },
  savedSection: {
    marginBottom: spacing.md,
  },
  savedTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.fg.primary,
    marginBottom: spacing.sm,
  },
  savedScroll: {
    marginHorizontal: -spacing.md,
    paddingHorizontal: spacing.md,
  },
  savedRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  savedCard: {
    width: 150,
    padding: spacing.sm,
    backgroundColor: colors.bg.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  savedName: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.fg.primary,
    marginBottom: spacing.xs,
  },
  savedDate: {
    fontSize: 11,
    color: colors.fg.tertiary,
  },
  savedRemove: {
    position: 'absolute',
    top: 6,
    right: 6,
  },
  searchResultsSection: {
    marginBottom: spacing.md,
  },
  searchResultsTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.fg.primary,
    marginBottom: spacing.sm,
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
