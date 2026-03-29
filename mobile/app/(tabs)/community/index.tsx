import { useState, useCallback, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, ActivityIndicator, RefreshControl, TextInput, Image, Dimensions, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import Svg, { Path } from 'react-native-svg';
import { colors, typography, spacing, radius } from '@/theme';
import { PostCard } from '@/components/community';
import { CommunityFeedSkeleton } from '@/components/ui';
import { getFeed, getTags, getMyPosts, getFeatured } from '@/api/community';
import { API_BASE, apiFetch } from '@/api/client';
import { useAuthStore } from '@/stores/authStore';
import type { UgcPost } from '@shared/types';

const SCREEN_WIDTH = Dimensions.get('window').width;

function resolveMediaUrl(url: string | null): string | null {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${API_BASE}${url}`;
}

type FeedType = 'discover' | 'following' | 'mine';

export default function CommunityFeed() {
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [activeFeed, setActiveFeed] = useState<FeedType>('discover');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const isLoggedIn = !!useAuthStore((s) => s.accessToken);

  // Debounce search query for people search API calls
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery.trim()), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useFocusEffect(
    useCallback(() => {
      return () => {
        setSearchQuery('');
      };
    }, [])
  );

  const { data: tagsData } = useQuery({
    queryKey: ['community-tags'],
    queryFn: getTags,
  });

  // Main feed query (discover / following)
  const feedQuery = useInfiniteQuery({
    queryKey: ['community-feed', selectedTag, activeFeed],
    queryFn: ({ pageParam }) => {
      if (activeFeed === 'mine') {
        return getMyPosts({ cursor: pageParam, limit: 15 });
      }
      return getFeed({
        cursor: pageParam,
        limit: 15,
        tag: selectedTag || undefined,
        feed: activeFeed === 'following' ? 'following' : undefined,
      });
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });

  // Trending posts (2B)
  const { data: trendingData } = useQuery({
    queryKey: ['community-trending'],
    queryFn: () => getFeatured(6),
    staleTime: 5 * 60 * 1000,
  });

  const trendingPosts = trendingData?.posts ?? [];

  // People search when search is active
  const { data: usersData } = useQuery({
    queryKey: ['user-search', debouncedSearch],
    queryFn: () => apiFetch<{ users: { id: string; firstName: string | null; lastName: string | null; displayName: string; avatarUrl: string | null; followersCount: number; isFollowing: boolean }[] }>(`/api/users/search?q=${encodeURIComponent(debouncedSearch)}&limit=5`),
    enabled: !!debouncedSearch && debouncedSearch.length >= 2 && isLoggedIn,
  });

  const posts = feedQuery.data?.pages.flatMap((p) => p.posts) ?? [];
  const tags = tagsData?.tags ?? [];

  // Client-side search filtering (2A)
  const filteredPosts = useMemo(() => {
    if (!searchQuery.trim()) return posts;
    const q = searchQuery.toLowerCase();
    return posts.filter(
      (p) =>
        p.caption?.toLowerCase().includes(q) ||
        p.user?.displayName?.toLowerCase().includes(q) ||
        p.user?.firstName?.toLowerCase().includes(q)
    );
  }, [posts, searchQuery]);

  // Optimistic update helper for like/save instead of refetching (1D)
  const handlePostInteraction = useCallback(() => {
    // No-op: PostCard handles optimistic state internally.
    // We no longer refetch the entire feed on each interaction.
  }, []);

  const renderPost = useCallback(({ item }: { item: UgcPost }) => (
    <PostCard post={item} onInteraction={handlePostInteraction} />
  ), [handlePostInteraction]);

  const handleEndReached = useCallback(() => {
    if (feedQuery.hasNextPage && !feedQuery.isFetchingNextPage) feedQuery.fetchNextPage();
  }, [feedQuery.hasNextPage, feedQuery.isFetchingNextPage, feedQuery.fetchNextPage]);

  // Empty state content based on active feed (1F)
  const renderEmptyState = () => {
    if (activeFeed === 'following') {
      return (
        <View style={styles.centered}>
          <Text style={styles.emptyTitle}>Your feed is empty</Text>
          <Text style={styles.emptyText}>Follow creators to see their posts here</Text>
          <Pressable onPress={() => setActiveFeed('discover')} style={styles.emptyButton}>
            <Text style={styles.emptyButtonText}>Discover People</Text>
          </Pressable>
        </View>
      );
    }
    if (activeFeed === 'mine') {
      return (
        <View style={styles.centered}>
          <Text style={styles.emptyTitle}>You haven't posted yet</Text>
          <Text style={styles.emptyText}>Share your Pilates journey with the community!</Text>
          <Pressable onPress={() => router.push('/(tabs)/community/create')} style={styles.emptyButton}>
            <Text style={styles.emptyButtonText}>Create a Post</Text>
          </Pressable>
        </View>
      );
    }
    // Discover
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyTitle}>Be the first to post!</Text>
        <Text style={styles.emptyText}>Share your Pilates journey with the community</Text>
        {isLoggedIn && (
          <Pressable onPress={() => router.push('/(tabs)/community/create')} style={styles.emptyButton}>
            <Text style={styles.emptyButtonText}>Create a Post</Text>
          </Pressable>
        )}
      </View>
    );
  };

  // Trending carousel (2B)
  const renderTrendingItem = useCallback(({ item }: { item: UgcPost }) => {
    const imageUrl = resolveMediaUrl(item.mediaUrl) || resolveMediaUrl(item.thumbnailUrl);
    const displayName = item.user?.displayName || item.user?.firstName || 'Anonymous';
    return (
      <Pressable
        onPress={() => router.push(`/(tabs)/community/${item.id}`)}
        style={styles.trendingCard}
      >
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.trendingImage} resizeMode="cover" />
        ) : (
          <View style={[styles.trendingImage, styles.trendingPlaceholder]}>
            <Text style={styles.trendingPlaceholderText}>{displayName[0]?.toUpperCase()}</Text>
          </View>
        )}
        <View style={styles.trendingOverlay}>
          <Text style={styles.trendingName} numberOfLines={1}>{displayName}</Text>
          <View style={styles.trendingLikes}>
            <Svg width={12} height={12} viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth={1}>
              <Path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
            </Svg>
            <Text style={styles.trendingLikesText}>{item.likesCount}</Text>
          </View>
        </View>
      </Pressable>
    );
  }, []);

  // People search results component
  const PeopleResults = useMemo(() => {
    if (!debouncedSearch || !usersData?.users?.length) return null;
    return (
      <View style={styles.peopleSection}>
        <Text style={styles.peopleSectionTitle}>People</Text>
        {usersData.users.map((user: { id: string; firstName: string | null; lastName: string | null; displayName: string; avatarUrl: string | null; followersCount: number }) => (
          <Pressable key={user.id} onPress={() => router.push(`/community-profile/${user.id}`)} style={styles.userRow}>
            <View style={styles.userAvatar}>
              <Text style={styles.userAvatarText}>{user.firstName?.[0]?.toUpperCase() || '?'}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.userName}>{user.displayName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User'}</Text>
              <Text style={styles.userMeta}>{user.followersCount || 0} followers</Text>
            </View>
          </Pressable>
        ))}
      </View>
    );
  }, [debouncedSearch, usersData]);

  const ListHeader = useMemo(() => {
    // When searching, show people results as header
    if (debouncedSearch && PeopleResults) return PeopleResults;
    if (activeFeed !== 'discover' || trendingPosts.length === 0) return null;
    return (
      <View style={styles.trendingSection}>
        <Text style={styles.trendingSectionTitle}>Trending</Text>
        <FlatList
          data={trendingPosts}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(p) => `trending-${p.id}`}
          contentContainerStyle={styles.trendingList}
          renderItem={renderTrendingItem}
        />
      </View>
    );
  }, [activeFeed, trendingPosts, renderTrendingItem, debouncedSearch, PeopleResults]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Community</Text>
        <View style={styles.headerActions}>
          {isLoggedIn ? (
            <>
              <Pressable onPress={() => setShowSearch((s) => !s)} style={styles.headerButton} hitSlop={8}>
                <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={showSearch ? colors.fg.primary : colors.fg.secondary} strokeWidth={1.5}>
                  <Path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
              </Pressable>
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
          ) : (
            <>
              <Pressable onPress={() => setShowSearch((s) => !s)} style={styles.headerButton} hitSlop={8}>
                <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={colors.fg.secondary} strokeWidth={1.5}>
                  <Path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
              </Pressable>
              <Pressable onPress={() => router.push('/auth/login')} style={styles.signInButton}>
                <Text style={styles.signInButtonText}>Sign In</Text>
              </Pressable>
            </>
          )}
        </View>
      </View>

      {/* Search bar (2A) */}
      {showSearch && (
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search posts..."
            placeholderTextColor={colors.fg.muted}
            autoFocus
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')} style={styles.searchClear}>
              <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={colors.fg.tertiary} strokeWidth={2}>
                <Path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            </Pressable>
          )}
        </View>
      )}

      {/* Feed Tabs (1E: added Mine tab) */}
      {isLoggedIn && (
        <View style={styles.feedTabs}>
          {(['discover', 'following', 'mine'] as FeedType[]).map((tab) => (
            <Pressable
              key={tab}
              onPress={() => setActiveFeed(tab)}
              style={[styles.feedTab, activeFeed === tab && styles.feedTabActive]}
            >
              <Text style={[styles.feedTabText, activeFeed === tab && styles.feedTabTextActive]}>
                {tab === 'discover' ? 'Discover' : tab === 'following' ? 'Following' : 'Mine'}
              </Text>
            </Pressable>
          ))}
        </View>
      )}

      {/* Tag filters */}
      {tags.length > 0 && activeFeed !== 'mine' && (
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
      {feedQuery.isLoading ? (
        <CommunityFeedSkeleton />
      ) : feedQuery.isError ? (
        <View style={styles.centered}>
          <Text style={styles.emptyTitle}>Something went wrong</Text>
          <Text style={styles.emptyText}>We couldn't load the feed. Please try again.</Text>
          <Pressable onPress={() => feedQuery.refetch()} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </Pressable>
        </View>
      ) : filteredPosts.length === 0 ? (
        searchQuery.trim() ? (
          <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
            {PeopleResults}
            <View style={styles.centered}>
              <Text style={styles.emptyTitle}>No posts found</Text>
              <Text style={styles.emptyText}>No posts matching "{searchQuery}"</Text>
            </View>
          </ScrollView>
        ) : (
          renderEmptyState()
        )
      ) : (
        <FlatList
          data={filteredPosts}
          keyExtractor={(p) => p.id}
          renderItem={renderPost}
          contentContainerStyle={styles.feedList}
          showsVerticalScrollIndicator={false}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.5}
          refreshControl={
            <RefreshControl
              refreshing={feedQuery.isRefetching}
              onRefresh={feedQuery.refetch}
              tintColor={colors.fg.primary}
              title={feedQuery.isRefetching ? 'Refreshing...' : 'Pull to refresh'}
              titleColor={colors.fg.tertiary}
            />
          }
          ListHeaderComponent={ListHeader}
          ListFooterComponent={
            feedQuery.isFetchingNextPage ? <ActivityIndicator color={colors.fg.primary} style={styles.footerLoader} /> : null
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
  headerActions: { flexDirection: 'row', gap: spacing.md, alignItems: 'center' },
  headerButton: { padding: spacing.xs },
  feedTabs: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: colors.border.default },
  feedTab: { flex: 1, alignItems: 'center', paddingVertical: spacing.sm, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  feedTabActive: { borderBottomColor: colors.fg.primary },
  feedTabText: { fontSize: typography.sizes.sm, color: colors.fg.tertiary },
  feedTabTextActive: { color: colors.fg.primary, fontWeight: typography.weights.semibold },
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
  retryButton: { marginTop: spacing.md, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderRadius: radius.md, backgroundColor: colors.fg.primary },
  retryButtonText: { fontSize: typography.sizes.sm, fontWeight: typography.weights.semibold, color: colors.bg.primary },
  feedList: { padding: spacing.md, paddingBottom: 100 },
  footerLoader: { padding: spacing.lg },
  signInButton: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: radius.md, backgroundColor: colors.fg.primary },
  signInButtonText: { fontSize: typography.sizes.sm, fontWeight: typography.weights.semibold, color: colors.bg.primary },
  // Search (2A)
  searchContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md, paddingBottom: spacing.sm },
  searchInput: { flex: 1, backgroundColor: colors.bg.card, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border.default, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, fontSize: typography.sizes.sm, color: colors.fg.primary },
  searchClear: { padding: spacing.sm, marginLeft: spacing.xs },
  // Trending (2B)
  trendingSection: { marginBottom: spacing.md },
  trendingSectionTitle: { fontSize: typography.sizes.base, fontWeight: typography.weights.semibold, color: colors.fg.primary, marginBottom: spacing.sm },
  trendingList: { gap: spacing.sm },
  trendingCard: { width: 140, height: 180, borderRadius: radius.md, overflow: 'hidden', backgroundColor: colors.cream05 },
  trendingImage: { width: '100%', height: '100%' },
  trendingPlaceholder: { alignItems: 'center', justifyContent: 'center', backgroundColor: colors.cream10 },
  trendingPlaceholderText: { fontSize: typography.sizes['2xl'], fontWeight: typography.weights.bold, color: colors.fg.tertiary },
  trendingOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: spacing.sm, backgroundColor: 'rgba(0,0,0,0.4)' },
  trendingName: { fontSize: 11, color: 'white', fontWeight: typography.weights.semibold },
  trendingLikes: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  trendingLikesText: { fontSize: 10, color: 'white' },
  // People search
  peopleSection: { paddingHorizontal: spacing.md, paddingTop: spacing.md, paddingBottom: spacing.sm },
  peopleSectionTitle: { fontSize: typography.sizes.base, fontWeight: typography.weights.semibold, color: colors.fg.primary, marginBottom: spacing.sm },
  userRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border.default },
  userAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.cream10, alignItems: 'center', justifyContent: 'center' },
  userAvatarText: { fontSize: typography.sizes.base, fontWeight: typography.weights.semibold, color: colors.fg.tertiary },
  userName: { fontSize: typography.sizes.sm, fontWeight: typography.weights.medium, color: colors.fg.primary },
  userMeta: { fontSize: 11, color: colors.fg.tertiary, marginTop: 1 },
});
