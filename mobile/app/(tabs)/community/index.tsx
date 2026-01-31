import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import Svg, { Path } from 'react-native-svg';
import { colors, typography, spacing, radius } from '@/theme';
import { PostCard } from '@/components/community';
import { getFeed, getTags } from '@/api/community';
import { useAuthStore } from '@/stores/authStore';
import type { UgcPost } from '@shared/types';

export default function CommunityFeed() {
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const isLoggedIn = !!useAuthStore((s) => s.accessToken);

  const { data: tagsData } = useQuery({
    queryKey: ['community-tags'],
    queryFn: getTags,
  });

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    refetch,
    isRefetching,
  } = useInfiniteQuery({
    queryKey: ['community-feed', selectedTag],
    queryFn: ({ pageParam }) => getFeed({ cursor: pageParam, limit: 15, tag: selectedTag || undefined }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });

  const posts = data?.pages.flatMap((p) => p.posts) ?? [];
  const tags = tagsData?.tags ?? [];

  const renderPost = useCallback(({ item }: { item: UgcPost }) => (
    <PostCard post={item} onInteraction={() => refetch()} />
  ), [refetch]);

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Community</Text>
        <View style={styles.headerActions}>
          {isLoggedIn && (
            <>
              <Pressable onPress={() => router.push('/(tabs)/community/saved')} style={styles.headerButton} hitSlop={8}>
                <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={colors.fg.secondary} strokeWidth={1.5}>
                  <Path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
              </Pressable>
              <Pressable onPress={() => router.push('/(tabs)/community/create')} style={styles.headerButton} hitSlop={8}>
                <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={colors.fg.primary} strokeWidth={2}>
                  <Path d="M12 5v14M5 12h14" strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
              </Pressable>
            </>
          )}
        </View>
      </View>

      {/* Tag filters */}
      {tags.length > 0 && (
        <View style={styles.tagsContainer}>
          <FlatList
            data={[{ id: 'all', name: 'All', slug: '' }, ...tags]}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(t) => t.id}
            contentContainerStyle={styles.tagsList}
            renderItem={({ item }) => {
              const isActive = item.slug === '' ? selectedTag === null : selectedTag === item.slug;
              return (
                <Pressable
                  onPress={() => setSelectedTag(item.slug === '' ? null : item.slug)}
                  style={[styles.tagChip, isActive && styles.tagChipActive]}
                >
                  <Text style={[styles.tagChipText, isActive && styles.tagChipTextActive]}>
                    {item.name}
                  </Text>
                </Pressable>
              );
            }}
          />
        </View>
      )}

      {/* Feed */}
      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.fg.primary} />
        </View>
      ) : posts.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyTitle}>No posts yet</Text>
          <Text style={styles.emptyText}>Be the first to share something with the community!</Text>
          {isLoggedIn && (
            <Pressable onPress={() => router.push('/(tabs)/community/create')} style={styles.emptyButton}>
              <Text style={styles.emptyButtonText}>Create a Post</Text>
            </Pressable>
          )}
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(p) => p.id}
          renderItem={renderPost}
          contentContainerStyle={styles.feedList}
          showsVerticalScrollIndicator={false}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.5}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.fg.primary} />
          }
          ListFooterComponent={
            isFetchingNextPage ? <ActivityIndicator color={colors.fg.primary} style={styles.footerLoader} /> : null
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.primary },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  title: { fontSize: typography.sizes['2xl'], fontWeight: typography.weights.bold, color: colors.fg.primary },
  headerActions: { flexDirection: 'row', gap: spacing.md },
  headerButton: { padding: spacing.xs },
  tagsContainer: { borderBottomWidth: 1, borderBottomColor: colors.border.default },
  tagsList: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, gap: spacing.sm },
  tagChip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: radius.full, backgroundColor: colors.bg.card, borderWidth: 1, borderColor: colors.border.default },
  tagChipActive: { backgroundColor: colors.fg.primary, borderColor: colors.fg.primary },
  tagChipText: { fontSize: typography.sizes.sm, color: colors.fg.secondary },
  tagChipTextActive: { color: colors.bg.primary },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  emptyTitle: { fontSize: typography.sizes.lg, fontWeight: typography.weights.semibold, color: colors.fg.primary, marginBottom: spacing.sm },
  emptyText: { fontSize: typography.sizes.sm, color: colors.fg.tertiary, textAlign: 'center', marginBottom: spacing.lg },
  emptyButton: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderRadius: radius.md, backgroundColor: colors.fg.primary },
  emptyButtonText: { fontSize: typography.sizes.sm, fontWeight: typography.weights.semibold, color: colors.bg.primary },
  feedList: { padding: spacing.md },
  footerLoader: { padding: spacing.lg },
});
