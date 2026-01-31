import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, Image, Dimensions, Linking, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import Svg, { Path } from 'react-native-svg';
import { colors, typography, spacing, radius } from '@/theme';
import { CommentSection } from '@/components/community';
import { getPost, likePost, unlikePost, savePost, unsavePost, deletePost } from '@/api/community';
import { API_BASE } from '@/api/client';
import { useAuthStore } from '@/stores/authStore';
import type { UgcPost } from '@shared/types';

const SCREEN_WIDTH = Dimensions.get('window').width;

function resolveMediaUrl(url: string | null): string | null {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${API_BASE}${url}`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function PostDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();
  const isLoggedIn = !!useAuthStore((s) => s.accessToken);

  const { data: post, isLoading } = useQuery<UgcPost>({
    queryKey: ['community-post', id],
    queryFn: () => getPost(id!),
    enabled: !!id,
  });

  const [liked, setLiked] = useState(post?.isLiked ?? false);
  const [saved, setSaved] = useState(post?.isSaved ?? false);
  const [likesCount, setLikesCount] = useState(post?.likesCount ?? 0);

  // Sync state when post loads
  if (post && liked !== (post.isLiked ?? false) && likesCount === 0) {
    setLiked(post.isLiked ?? false);
    setSaved(post.isSaved ?? false);
    setLikesCount(post.likesCount);
  }

  const handleLike = async () => {
    if (!isLoggedIn || !post) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const wasLiked = liked;
    setLiked(!wasLiked);
    setLikesCount((c) => c + (wasLiked ? -1 : 1));
    try {
      if (wasLiked) await unlikePost(post.id);
      else await likePost(post.id);
    } catch {
      setLiked(wasLiked);
      setLikesCount((c) => c + (wasLiked ? 1 : -1));
    }
  };

  const handleSave = async () => {
    if (!isLoggedIn || !post) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const wasSaved = saved;
    setSaved(!wasSaved);
    try {
      if (wasSaved) await unsavePost(post.id);
      else await savePost(post.id);
    } catch {
      setSaved(wasSaved);
    }
  };

  const handleDelete = () => {
    if (!post?.isOwner) return;
    Alert.alert('Delete Post', 'Are you sure you want to delete this post?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deletePost(post.id);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            queryClient.invalidateQueries({ queryKey: ['community-feed'] });
            queryClient.invalidateQueries({ queryKey: ['community-my-posts'] });
            router.back();
          } catch {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          }
        },
      },
    ]);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.centered}><ActivityIndicator color={colors.fg.primary} /></View>
      </SafeAreaView>
    );
  }

  if (!post) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.centered}>
          <Text style={styles.errorText}>Post not found</Text>
          <Pressable onPress={() => router.back()}><Text style={styles.link}>Go back</Text></Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const displayName = post.user?.displayName || post.user?.firstName || 'Anonymous';
  const imageUrl = resolveMediaUrl(post.mediaUrl) || resolveMediaUrl(post.thumbnailUrl);
  const aspectRatio = post.aspectRatio || 1;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={colors.fg.primary} strokeWidth={2}>
            <Path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </Pressable>
        <Text style={styles.headerTitle}>Post</Text>
        {post.isOwner && (
          <Pressable onPress={handleDelete} style={styles.deleteButton} hitSlop={8}>
            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="rgba(239, 68, 68, 0.8)" strokeWidth={1.5}>
              <Path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </Pressable>
        )}
        {!post.isOwner && <View style={{ width: 36 }} />}
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Author */}
        <View style={styles.authorRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{displayName[0]?.toUpperCase()}</Text>
          </View>
          <View style={styles.authorInfo}>
            <Text style={styles.authorName}>{displayName}</Text>
            <Text style={styles.postDate}>{formatDate(post.createdAt)}</Text>
          </View>
        </View>

        {/* Media */}
        {imageUrl && (
          <Image
            source={{ uri: imageUrl }}
            style={[styles.image, { width: SCREEN_WIDTH, height: SCREEN_WIDTH / aspectRatio }]}
            resizeMode="cover"
          />
        )}

        {/* Instagram link */}
        {post.mediaType === 'instagram' && post.instagramUrl && (
          <Pressable onPress={() => Linking.openURL(post.instagramUrl!)} style={styles.instagramLink}>
            <Text style={styles.instagramLinkText}>View on Instagram</Text>
            <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={colors.fg.secondary} strokeWidth={1.5}>
              <Path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </Pressable>
        )}

        {/* Workout recap */}
        {post.workoutRecap && (
          <View style={styles.recapCard}>
            <Text style={styles.recapTitle}>Workout Recap</Text>
            <View style={styles.recapStats}>
              <View style={styles.recapStat}>
                <Text style={styles.recapStatValue}>{post.workoutRecap.durationMinutes}m</Text>
                <Text style={styles.recapStatLabel}>Duration</Text>
              </View>
              <View style={styles.recapStat}>
                <Text style={styles.recapStatValue}>{post.workoutRecap.workoutType}</Text>
                <Text style={styles.recapStatLabel}>Type</Text>
              </View>
              {post.workoutRecap.rpe && (
                <View style={styles.recapStat}>
                  <Text style={styles.recapStatValue}>{post.workoutRecap.rpe}</Text>
                  <Text style={styles.recapStatLabel}>RPE</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Actions */}
        <View style={styles.actionsRow}>
          <Pressable onPress={handleLike} style={styles.actionButton} hitSlop={8}>
            <Svg width={22} height={22} viewBox="0 0 24 24" fill={liked ? 'rgba(239, 68, 68, 0.9)' : 'none'} stroke={liked ? 'rgba(239, 68, 68, 0.9)' : colors.fg.secondary} strokeWidth={1.5}>
              <Path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
            <Text style={[styles.actionText, liked && styles.actionTextActive]}>{likesCount || post.likesCount} likes</Text>
          </Pressable>

          <Pressable onPress={handleSave} style={styles.actionButton} hitSlop={8}>
            <Svg width={22} height={22} viewBox="0 0 24 24" fill={saved ? colors.fg.primary : 'none'} stroke={colors.fg.secondary} strokeWidth={1.5}>
              <Path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
            <Text style={styles.actionText}>{saved ? 'Saved' : 'Save'}</Text>
          </Pressable>
        </View>

        {/* Caption */}
        {post.caption && (
          <View style={styles.captionSection}>
            <Text style={styles.caption}>
              <Text style={styles.captionUser}>{displayName} </Text>
              {post.caption}
            </Text>
          </View>
        )}

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <View style={styles.tagsRow}>
            {post.tags.map(({ tag }) => (
              <View key={tag.id} style={styles.tag}>
                <Text style={styles.tagText}>{tag.name}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Studio */}
        {post.studio && (
          <View style={styles.studioRow}>
            <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={colors.fg.tertiary} strokeWidth={1.5}>
              <Path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" strokeLinecap="round" strokeLinejoin="round" />
              <Path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
            <Text style={styles.studioName}>{post.studio.name}, {post.studio.city}</Text>
          </View>
        )}

        {/* Comments */}
        <View style={styles.commentsSection}>
          <CommentSection postId={post.id} />
        </View>
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
  deleteButton: { padding: spacing.xs },
  scroll: { flex: 1 },
  authorRow: { flexDirection: 'row', alignItems: 'center', padding: spacing.md },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.cream10, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: typography.sizes.base, fontWeight: typography.weights.semibold, color: colors.fg.primary },
  authorInfo: { marginLeft: spacing.sm },
  authorName: { fontSize: typography.sizes.base, fontWeight: typography.weights.semibold, color: colors.fg.primary },
  postDate: { fontSize: typography.sizes.sm, color: colors.fg.tertiary },
  image: { backgroundColor: colors.cream05 },
  instagramLink: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, backgroundColor: colors.cream05 },
  instagramLinkText: { fontSize: typography.sizes.sm, color: colors.fg.secondary },
  recapCard: { margin: spacing.md, padding: spacing.md, backgroundColor: colors.bg.card, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border.default },
  recapTitle: { fontSize: typography.sizes.sm, fontWeight: typography.weights.semibold, color: colors.fg.primary, marginBottom: spacing.sm },
  recapStats: { flexDirection: 'row', justifyContent: 'space-around' },
  recapStat: { alignItems: 'center' },
  recapStatValue: { fontSize: typography.sizes.lg, fontWeight: typography.weights.semibold, color: colors.fg.primary, textTransform: 'capitalize' },
  recapStatLabel: { fontSize: 10, color: colors.fg.tertiary, textTransform: 'uppercase' },
  actionsRow: { flexDirection: 'row', gap: spacing.lg, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  actionButton: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  actionText: { fontSize: typography.sizes.sm, color: colors.fg.secondary },
  actionTextActive: { color: 'rgba(239, 68, 68, 0.9)' },
  captionSection: { paddingHorizontal: spacing.md, paddingBottom: spacing.sm },
  caption: { fontSize: typography.sizes.base, color: colors.fg.secondary, lineHeight: 22 },
  captionUser: { fontWeight: typography.weights.semibold, color: colors.fg.primary },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, paddingHorizontal: spacing.md, paddingBottom: spacing.sm },
  tag: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: radius.full, backgroundColor: colors.cream05 },
  tagText: { fontSize: typography.sizes.sm, color: colors.fg.tertiary },
  studioRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, paddingHorizontal: spacing.md, paddingBottom: spacing.md },
  studioName: { fontSize: typography.sizes.sm, color: colors.fg.tertiary },
  commentsSection: { padding: spacing.md, borderTopWidth: 1, borderTopColor: colors.border.default, paddingBottom: 100 },
});
