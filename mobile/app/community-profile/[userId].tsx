import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, ActivityIndicator, Image, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import Svg, { Path } from 'react-native-svg';
import { colors, typography, spacing, radius } from '@/theme';
import { getFeed } from '@/api/community';
import { getFollowers, getFollowing, followUser, unfollowUser } from '@/api/social';
import { API_BASE } from '@/api/client';
import { useAuthStore } from '@/stores/authStore';
import type { UgcPost } from '@shared/types';

const SCREEN_WIDTH = Dimensions.get('window').width;
const GRID_GAP = 2;
const GRID_ITEM_SIZE = (SCREEN_WIDTH - GRID_GAP * 2) / 3;

function resolveMediaUrl(url: string | null): string | null {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${API_BASE}${url}`;
}

export default function CommunityUserProfile() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const isLoggedIn = !!useAuthStore((s) => s.accessToken);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  // Search for the user to get their display info and follow status
  // We use the followers endpoint to get counts
  const { data: followersData } = useQuery({
    queryKey: ['user-followers', userId],
    queryFn: () => getFollowers(userId!, { limit: 1 }),
    enabled: !!userId,
  });

  const { data: followingData } = useQuery({
    queryKey: ['user-following', userId],
    queryFn: () => getFollowing(userId!, { limit: 1 }),
    enabled: !!userId,
  });

  // Get user's posts using the feed endpoint (public)
  const postsQuery = useInfiniteQuery({
    queryKey: ['user-posts', userId],
    queryFn: ({ pageParam }) => getFeed({
      cursor: pageParam,
      limit: 30,
    }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: !!userId,
  });

  const allPosts = postsQuery.data?.pages.flatMap((p) => p.posts) ?? [];
  // Filter to only this user's posts
  const userPosts = allPosts.filter((p) => p.userId === userId);
  const displayName = userPosts[0]?.user?.displayName || userPosts[0]?.user?.firstName || 'User';
  const postCount = userPosts.length;

  const handleFollow = async () => {
    if (!isLoggedIn || !userId || followLoading) return;
    setFollowLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      if (isFollowing) {
        await unfollowUser(userId);
        setIsFollowing(false);
      } else {
        await followUser(userId);
        setIsFollowing(true);
      }
    } catch {
      // revert on error
    } finally {
      setFollowLoading(false);
    }
  };

  const renderGridItem = useCallback(({ item }: { item: UgcPost }) => {
    const imageUrl = resolveMediaUrl(item.mediaUrl) || resolveMediaUrl(item.thumbnailUrl);
    return (
      <Pressable
        onPress={() => router.push(`/(tabs)/community/${item.id}`)}
        style={styles.gridItem}
      >
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.gridImage} resizeMode="cover" />
        ) : (
          <View style={[styles.gridImage, styles.gridPlaceholder]}>
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={colors.fg.muted} strokeWidth={1.5}>
              <Path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </View>
        )}
      </Pressable>
    );
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={colors.fg.primary} strokeWidth={2}>
            <Path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>{displayName}</Text>
        <View style={{ width: 36 }} />
      </View>

      <FlatList
        data={userPosts}
        numColumns={3}
        keyExtractor={(p) => p.id}
        renderItem={renderGridItem}
        contentContainerStyle={styles.gridList}
        showsVerticalScrollIndicator={false}
        columnWrapperStyle={styles.gridRow}
        ListHeaderComponent={
          <View style={styles.profileHeader}>
            {/* Avatar */}
            <View style={styles.profileAvatar}>
              <Text style={styles.profileAvatarText}>{displayName[0]?.toUpperCase()}</Text>
            </View>

            <Text style={styles.profileName}>{displayName}</Text>

            {/* Stats row */}
            <View style={styles.statsRow}>
              <View style={styles.stat}>
                <Text style={styles.statValue}>{postCount}</Text>
                <Text style={styles.statLabel}>Posts</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statValue}>{followersData?.followers?.length ?? 0}</Text>
                <Text style={styles.statLabel}>Followers</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statValue}>{followingData?.following?.length ?? 0}</Text>
                <Text style={styles.statLabel}>Following</Text>
              </View>
            </View>

            {/* Follow button */}
            {isLoggedIn && (
              <Pressable
                onPress={handleFollow}
                style={[styles.followButton, isFollowing && styles.followButtonActive]}
                disabled={followLoading}
              >
                {followLoading ? (
                  <ActivityIndicator size="small" color={isFollowing ? colors.fg.primary : colors.bg.primary} />
                ) : (
                  <Text style={[styles.followButtonText, isFollowing && styles.followButtonTextActive]}>
                    {isFollowing ? 'Following' : 'Follow'}
                  </Text>
                )}
              </Pressable>
            )}

            {/* Divider before grid */}
            {userPosts.length > 0 && (
              <Text style={styles.postsLabel}>Posts</Text>
            )}
          </View>
        }
        ListEmptyComponent={
          postsQuery.isLoading ? (
            <ActivityIndicator color={colors.fg.primary} style={styles.loader} />
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No posts yet</Text>
            </View>
          )
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.primary },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  backButton: { padding: spacing.xs, marginRight: spacing.sm },
  headerTitle: { flex: 1, fontSize: typography.sizes.lg, fontWeight: typography.weights.semibold, color: colors.fg.primary },
  profileHeader: { alignItems: 'center', padding: spacing.lg, paddingBottom: spacing.md },
  profileAvatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.cream10, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md },
  profileAvatarText: { fontSize: typography.sizes['2xl'], fontWeight: typography.weights.bold, color: colors.fg.primary },
  profileName: { fontSize: typography.sizes.lg, fontWeight: typography.weights.semibold, color: colors.fg.primary, marginBottom: spacing.md },
  statsRow: { flexDirection: 'row', gap: spacing.xl, marginBottom: spacing.md },
  stat: { alignItems: 'center' },
  statValue: { fontSize: typography.sizes.lg, fontWeight: typography.weights.semibold, color: colors.fg.primary },
  statLabel: { fontSize: typography.sizes.sm, color: colors.fg.tertiary },
  followButton: { paddingHorizontal: spacing.xl, paddingVertical: spacing.sm, borderRadius: radius.md, backgroundColor: colors.fg.primary, marginBottom: spacing.lg },
  followButtonActive: { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.border.default },
  followButtonText: { fontSize: typography.sizes.sm, fontWeight: typography.weights.semibold, color: colors.bg.primary },
  followButtonTextActive: { color: colors.fg.primary },
  postsLabel: { fontSize: typography.sizes.sm, fontWeight: typography.weights.semibold, color: colors.fg.tertiary, textTransform: 'uppercase', letterSpacing: 1, alignSelf: 'flex-start', marginTop: spacing.sm },
  gridList: { paddingBottom: spacing.xl },
  gridRow: { gap: GRID_GAP },
  gridItem: { width: GRID_ITEM_SIZE, height: GRID_ITEM_SIZE, marginBottom: GRID_GAP },
  gridImage: { width: '100%', height: '100%', backgroundColor: colors.cream05 },
  gridPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  loader: { padding: spacing.xl },
  emptyState: { alignItems: 'center', padding: spacing.xl },
  emptyText: { fontSize: typography.sizes.sm, color: colors.fg.tertiary },
});
