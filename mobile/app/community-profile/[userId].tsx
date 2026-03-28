import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, ActivityIndicator, Image, Dimensions, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { useQuery, useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import Svg, { Path } from 'react-native-svg';
import { colors, typography, spacing, radius } from '@/theme';
import { getFeed } from '@/api/community';
import { getFollowers, getFollowing, followUser, unfollowUser, type UserSummary } from '@/api/social';
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
  const queryClient = useQueryClient();
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [followListModal, setFollowListModal] = useState<'followers' | 'following' | null>(null);

  // Get followers data
  const { data: followersData, isLoading: followersLoading } = useQuery({
    queryKey: ['user-followers', userId],
    queryFn: () => getFollowers(userId!, { limit: 100 }),
    enabled: !!userId,
  });

  // Get following data
  const { data: followingData, isLoading: followingLoading } = useQuery({
    queryKey: ['user-following', userId],
    queryFn: () => getFollowing(userId!, { limit: 100 }),
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
  const profileFollowersCount = followersData?.followers?.length ?? 0;
  const profileFollowingCount = followingData?.following?.length ?? 0;
  const isProfileLoading = postsQuery.isLoading || followersLoading || followingLoading;

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
      // Refresh follow counts
      queryClient.invalidateQueries({ queryKey: ['user-followers', userId] });
      queryClient.invalidateQueries({ queryKey: ['user-following', userId] });
    } catch {
      // revert on error
    } finally {
      setFollowLoading(false);
    }
  };

  // Render a user item in the followers/following modal list
  const renderUserItem = useCallback(({ item }: { item: UserSummary }) => {
    const name = item.displayName || item.firstName || 'User';
    return (
      <Pressable
        style={styles.userListItem}
        onPress={() => {
          setFollowListModal(null);
          router.push(`/community-profile/${item.id}`);
        }}
      >
        <View style={styles.userListAvatar}>
          <Text style={styles.userListAvatarText}>{name[0]?.toUpperCase()}</Text>
        </View>
        <Text style={styles.userListName} numberOfLines={1}>{name}</Text>
      </Pressable>
    );
  }, []);

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

      {/* Loading state (fix #9) */}
      {isProfileLoading ? (
        <View style={styles.profileLoadingContainer}>
          <View style={styles.profileAvatarSkeleton} />
          <View style={styles.profileNameSkeleton} />
          <View style={styles.statsRowSkeleton}>
            <View style={styles.statSkeleton} />
            <View style={styles.statSkeleton} />
            <View style={styles.statSkeleton} />
          </View>
          <ActivityIndicator color={colors.fg.primary} style={styles.loader} />
        </View>
      ) : (
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

              {/* Stats row - followers/following are clickable (improvement) */}
              <View style={styles.statsRow}>
                <View style={styles.stat}>
                  <Text style={styles.statValue}>{postCount}</Text>
                  <Text style={styles.statLabel}>Posts</Text>
                </View>
                <Pressable style={styles.stat} onPress={() => setFollowListModal('followers')}>
                  <Text style={styles.statValue}>{profileFollowersCount}</Text>
                  <Text style={[styles.statLabel, styles.statLabelClickable]}>Followers</Text>
                </Pressable>
                <Pressable style={styles.stat} onPress={() => setFollowListModal('following')}>
                  <Text style={styles.statValue}>{profileFollowingCount}</Text>
                  <Text style={[styles.statLabel, styles.statLabelClickable]}>Following</Text>
                </Pressable>
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
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No posts yet</Text>
            </View>
          }
        />
      )}

      {/* Followers/Following list modal */}
      <Modal
        visible={followListModal !== null}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setFollowListModal(null)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {followListModal === 'followers' ? 'Followers' : 'Following'}
            </Text>
            <Pressable onPress={() => setFollowListModal(null)} style={styles.modalClose}>
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={colors.fg.primary} strokeWidth={2}>
                <Path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            </Pressable>
          </View>
          <FlatList
            data={followListModal === 'followers'
              ? (followersData?.followers ?? [])
              : (followingData?.following ?? [])
            }
            keyExtractor={(item) => item.id}
            renderItem={renderUserItem}
            contentContainerStyle={styles.userList}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>
                  {followListModal === 'followers' ? 'No followers yet' : 'Not following anyone yet'}
                </Text>
              </View>
            }
          />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.primary },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  backButton: { padding: spacing.xs, marginRight: spacing.sm },
  headerTitle: { flex: 1, fontSize: typography.sizes.lg, fontWeight: typography.weights.semibold, color: colors.fg.primary },
  // Profile loading skeleton (fix #9)
  profileLoadingContainer: { alignItems: 'center', padding: spacing.lg },
  profileAvatarSkeleton: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.cream10, marginBottom: spacing.md },
  profileNameSkeleton: { width: 120, height: 20, borderRadius: radius.sm, backgroundColor: colors.cream10, marginBottom: spacing.md },
  statsRowSkeleton: { flexDirection: 'row', gap: spacing.xl, marginBottom: spacing.md },
  statSkeleton: { width: 50, height: 40, borderRadius: radius.sm, backgroundColor: colors.cream05 },
  // Profile header
  profileHeader: { alignItems: 'center', padding: spacing.lg, paddingBottom: spacing.md },
  profileAvatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.cream10, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md },
  profileAvatarText: { fontSize: typography.sizes['2xl'], fontWeight: typography.weights.bold, color: colors.fg.primary },
  profileName: { fontSize: typography.sizes.lg, fontWeight: typography.weights.semibold, color: colors.fg.primary, marginBottom: spacing.md },
  statsRow: { flexDirection: 'row', gap: spacing.xl, marginBottom: spacing.md },
  stat: { alignItems: 'center' },
  statValue: { fontSize: typography.sizes.lg, fontWeight: typography.weights.semibold, color: colors.fg.primary },
  statLabel: { fontSize: typography.sizes.sm, color: colors.fg.tertiary },
  statLabelClickable: { textDecorationLine: 'underline' },
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
  // Followers/Following modal
  modalContainer: { flex: 1, backgroundColor: colors.bg.primary },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border.default },
  modalTitle: { fontSize: typography.sizes.lg, fontWeight: typography.weights.semibold, color: colors.fg.primary },
  modalClose: { padding: spacing.xs },
  userList: { padding: spacing.md },
  userListItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border.default },
  userListAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.cream10, alignItems: 'center', justifyContent: 'center' },
  userListAvatarText: { fontSize: typography.sizes.sm, fontWeight: typography.weights.semibold, color: colors.fg.primary },
  userListName: { flex: 1, fontSize: typography.sizes.base, color: colors.fg.primary },
});
