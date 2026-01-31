import { useState, memo } from 'react';
import { View, Text, StyleSheet, Pressable, Image, Dimensions } from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Svg, { Path } from 'react-native-svg';
import { Card } from '@/components/ui';
import { colors, typography, spacing, radius } from '@/theme';
import { likePost, unlikePost, savePost, unsavePost } from '@/api/community';
import { API_BASE } from '@/api/client';
import { useAuthStore } from '@/stores/authStore';
import type { UgcPost } from '@shared/types';

interface PostCardProps {
  post: UgcPost;
  onInteraction?: () => void;
}

const SCREEN_WIDTH = Dimensions.get('window').width;
const IMAGE_WIDTH = SCREEN_WIDTH - spacing.md * 2;

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}w ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function resolveMediaUrl(url: string | null): string | null {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${API_BASE}${url}`;
}

export const PostCard = memo(function PostCard({ post, onInteraction }: PostCardProps) {
  const [liked, setLiked] = useState(post.isLiked ?? false);
  const [saved, setSaved] = useState(post.isSaved ?? false);
  const [likesCount, setLikesCount] = useState(post.likesCount);
  const isLoggedIn = !!useAuthStore((s) => s.accessToken);

  const displayName = post.user?.displayName || post.user?.firstName || 'Anonymous';
  const imageUrl = resolveMediaUrl(post.mediaUrl) || resolveMediaUrl(post.thumbnailUrl);
  const aspectRatio = post.aspectRatio || 1;

  const handleLike = async () => {
    if (!isLoggedIn) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const wasLiked = liked;
    setLiked(!wasLiked);
    setLikesCount((c) => c + (wasLiked ? -1 : 1));
    try {
      if (wasLiked) {
        await unlikePost(post.id);
      } else {
        await likePost(post.id);
      }
      onInteraction?.();
    } catch {
      setLiked(wasLiked);
      setLikesCount((c) => c + (wasLiked ? 1 : -1));
    }
  };

  const handleSave = async () => {
    if (!isLoggedIn) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const wasSaved = saved;
    setSaved(!wasSaved);
    try {
      if (wasSaved) {
        await unsavePost(post.id);
      } else {
        await savePost(post.id);
      }
      onInteraction?.();
    } catch {
      setSaved(wasSaved);
    }
  };

  return (
    <Card style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{displayName[0]?.toUpperCase()}</Text>
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.userName}>{displayName}</Text>
          <Text style={styles.timeAgo}>{timeAgo(post.createdAt)}</Text>
        </View>
        {post.studio && (
          <View style={styles.studioBadge}>
            <Text style={styles.studioText} numberOfLines={1}>{post.studio.name}</Text>
          </View>
        )}
      </View>

      {/* Media */}
      {post.mediaType === 'instagram' && post.instagramUrl ? (
        <Pressable onPress={() => router.push(`/(tabs)/community/${post.id}`)}>
          {imageUrl ? (
            <Image
              source={{ uri: imageUrl }}
              style={[styles.image, { width: IMAGE_WIDTH, height: IMAGE_WIDTH / aspectRatio }]}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.instagramPlaceholder, { width: IMAGE_WIDTH }]}>
              <Text style={styles.instagramLabel}>Instagram Post</Text>
              <Text style={styles.instagramHint}>Tap to view</Text>
            </View>
          )}
        </Pressable>
      ) : imageUrl ? (
        <Pressable onPress={() => router.push(`/(tabs)/community/${post.id}`)}>
          <Image
            source={{ uri: imageUrl }}
            style={[styles.image, { width: IMAGE_WIDTH, height: IMAGE_WIDTH / aspectRatio }]}
            resizeMode="cover"
          />
        </Pressable>
      ) : null}

      {/* Workout recap badge */}
      {post.workoutRecap && (
        <View style={styles.recapBadge}>
          <Text style={styles.recapText}>
            {post.workoutRecap.durationMinutes}m {post.workoutRecap.workoutType} workout
          </Text>
        </View>
      )}

      {/* Actions */}
      <View style={styles.actions}>
        <View style={styles.actionsLeft}>
          <Pressable onPress={handleLike} style={styles.actionButton} hitSlop={8}>
            <Svg width={20} height={20} viewBox="0 0 24 24" fill={liked ? 'rgba(239, 68, 68, 0.9)' : 'none'} stroke={liked ? 'rgba(239, 68, 68, 0.9)' : colors.fg.secondary} strokeWidth={1.5}>
              <Path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
            {likesCount > 0 && <Text style={[styles.actionCount, liked && styles.actionCountActive]}>{likesCount}</Text>}
          </Pressable>

          <Pressable onPress={() => router.push(`/(tabs)/community/${post.id}`)} style={styles.actionButton} hitSlop={8}>
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={colors.fg.secondary} strokeWidth={1.5}>
              <Path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
            {post.commentsCount > 0 && <Text style={styles.actionCount}>{post.commentsCount}</Text>}
          </Pressable>
        </View>

        <Pressable onPress={handleSave} style={styles.actionButton} hitSlop={8}>
          <Svg width={20} height={20} viewBox="0 0 24 24" fill={saved ? colors.fg.primary : 'none'} stroke={colors.fg.secondary} strokeWidth={1.5}>
            <Path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </Pressable>
      </View>

      {/* Caption */}
      {post.caption && (
        <Pressable onPress={() => router.push(`/(tabs)/community/${post.id}`)} style={styles.captionContainer}>
          <Text style={styles.caption} numberOfLines={3}>
            <Text style={styles.captionUser}>{displayName} </Text>
            {post.caption}
          </Text>
        </Pressable>
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
    </Card>
  );
});

const styles = StyleSheet.create({
  card: { marginBottom: spacing.md, overflow: 'hidden', padding: 0 },
  header: { flexDirection: 'row', alignItems: 'center', padding: spacing.sm, paddingHorizontal: spacing.md },
  avatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.cream10, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: typography.sizes.sm, fontWeight: typography.weights.semibold, color: colors.fg.primary },
  headerInfo: { flex: 1, marginLeft: spacing.sm },
  userName: { fontSize: typography.sizes.sm, fontWeight: typography.weights.semibold, color: colors.fg.primary },
  timeAgo: { fontSize: 11, color: colors.fg.tertiary },
  studioBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: radius.xs, backgroundColor: colors.cream05, maxWidth: 120 },
  studioText: { fontSize: 10, color: colors.fg.tertiary },
  image: { backgroundColor: colors.cream05 },
  instagramPlaceholder: { height: 200, backgroundColor: colors.cream05, alignItems: 'center', justifyContent: 'center' },
  instagramLabel: { fontSize: typography.sizes.base, color: colors.fg.secondary, fontWeight: typography.weights.medium },
  instagramHint: { fontSize: typography.sizes.sm, color: colors.fg.tertiary, marginTop: 4 },
  recapBadge: { backgroundColor: colors.cream10, paddingHorizontal: spacing.md, paddingVertical: spacing.xs },
  recapText: { fontSize: typography.sizes.sm, color: colors.fg.secondary, textTransform: 'capitalize' },
  actions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  actionsLeft: { flexDirection: 'row', gap: spacing.md },
  actionButton: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  actionCount: { fontSize: typography.sizes.sm, color: colors.fg.secondary },
  actionCountActive: { color: 'rgba(239, 68, 68, 0.9)' },
  captionContainer: { paddingHorizontal: spacing.md, paddingBottom: spacing.sm },
  caption: { fontSize: typography.sizes.sm, color: colors.fg.secondary, lineHeight: 18 },
  captionUser: { fontWeight: typography.weights.semibold, color: colors.fg.primary },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, paddingHorizontal: spacing.md, paddingBottom: spacing.sm },
  tag: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: radius.xs, backgroundColor: colors.cream05 },
  tagText: { fontSize: 11, color: colors.fg.tertiary },
});
