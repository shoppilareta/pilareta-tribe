import { View, Text, StyleSheet, ActivityIndicator, Pressable } from 'react-native';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/authStore';
import { getLogs } from '@/api/track';
import { WorkoutLogCard } from './WorkoutLogCard';
import { colors, typography, spacing } from '@/theme';
import type { WorkoutLog } from '@shared/types';

export function RecentLogs() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const {
    data,
    isLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['track-logs'],
    queryFn: ({ pageParam }) => getLogs({ cursor: pageParam, limit: 10 }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: isAuthenticated,
  });

  const logs: WorkoutLog[] = data?.pages.flatMap((page) => page.logs) ?? [];

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={colors.fg.primary} />
      </View>
    );
  }

  if (logs.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No workouts logged yet</Text>
        <Text style={styles.emptySubtext}>Tap the + button to log your first workout</Text>
      </View>
    );
  }

  return (
    <View>
      {logs.map((log) => (
        <WorkoutLogCard key={log.id} log={log} />
      ))}
      {hasNextPage && (
        <Pressable onPress={() => fetchNextPage()} style={styles.loadMore} disabled={isFetchingNextPage}>
          {isFetchingNextPage ? (
            <ActivityIndicator size="small" color={colors.fg.primary} />
          ) : (
            <Text style={styles.loadMoreText}>Load more</Text>
          )}
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyContainer: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: typography.sizes.base,
    color: colors.fg.secondary,
    marginBottom: spacing.xs,
  },
  emptySubtext: {
    fontSize: typography.sizes.sm,
    color: colors.fg.tertiary,
  },
  loadMore: {
    padding: spacing.md,
    alignItems: 'center',
  },
  loadMoreText: {
    fontSize: typography.sizes.sm,
    color: colors.fg.secondary,
    fontWeight: typography.weights.medium,
  },
});
