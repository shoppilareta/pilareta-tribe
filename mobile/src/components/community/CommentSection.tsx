import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, ActivityIndicator, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import Svg, { Path } from 'react-native-svg';
import { colors, typography, spacing, radius } from '@/theme';
import { getComments, addComment } from '@/api/community';
import { useAuthStore } from '@/stores/authStore';
import type { UgcComment } from '@shared/types';

interface CommentSectionProps {
  postId: string;
}

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return 'now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return `${Math.floor(days / 7)}w`;
}

function CommentItem({ comment }: { comment: UgcComment }) {
  const name = comment.user?.firstName
    ? `${comment.user.firstName}${comment.user.lastName ? ` ${comment.user.lastName[0]}.` : ''}`
    : 'Someone';

  return (
    <View style={styles.commentItem}>
      <View style={styles.commentAvatar}>
        <Text style={styles.commentAvatarText}>{name[0]?.toUpperCase()}</Text>
      </View>
      <View style={styles.commentBody}>
        <View style={styles.commentHeader}>
          <Text style={styles.commentUser}>{name}</Text>
          <Text style={styles.commentTime}>{timeAgo(comment.createdAt)}</Text>
        </View>
        <Text style={styles.commentText}>{comment.content}</Text>
      </View>
    </View>
  );
}

export function CommentSection({ postId }: CommentSectionProps) {
  const [text, setText] = useState('');
  const isLoggedIn = !!useAuthStore((s) => s.accessToken);
  const queryClient = useQueryClient();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteQuery({
    queryKey: ['community-comments', postId],
    queryFn: ({ pageParam }) => getComments(postId, { cursor: pageParam, limit: 20 }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });

  const mutation = useMutation({
    mutationFn: (content: string) => addComment(postId, content),
    onSuccess: () => {
      setText('');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      queryClient.invalidateQueries({ queryKey: ['community-comments', postId] });
      queryClient.invalidateQueries({ queryKey: ['community-post', postId] });
      queryClient.invalidateQueries({ queryKey: ['community-feed'] });
    },
    onError: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    },
  });

  const handleSubmit = () => {
    const trimmed = text.trim();
    if (!trimmed || mutation.isPending) return;
    mutation.mutate(trimmed);
  };

  const comments = data?.pages.flatMap((p) => p.comments) ?? [];

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={100}
    >
      <View style={styles.commentsHeader}>
        <Text style={styles.commentsTitle}>Comments</Text>
        <Text style={styles.commentsCount}>{comments.length}</Text>
      </View>

      {isLoading ? (
        <ActivityIndicator color={colors.fg.primary} style={styles.loader} />
      ) : comments.length === 0 ? (
        <Text style={styles.emptyText}>No comments yet. Be the first!</Text>
      ) : (
        <FlatList
          data={comments}
          keyExtractor={(c) => c.id}
          renderItem={({ item }) => <CommentItem comment={item} />}
          scrollEnabled={false}
          onEndReached={() => { if (hasNextPage) fetchNextPage(); }}
          ListFooterComponent={
            isFetchingNextPage ? <ActivityIndicator color={colors.fg.primary} style={styles.loader} /> : null
          }
        />
      )}

      {/* Comment input */}
      {isLoggedIn && (
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={text}
            onChangeText={setText}
            placeholder="Add a comment..."
            placeholderTextColor={colors.fg.muted}
            multiline
            maxLength={500}
          />
          <Pressable
            onPress={handleSubmit}
            disabled={!text.trim() || mutation.isPending}
            style={[styles.sendButton, (!text.trim() || mutation.isPending) && styles.sendButtonDisabled]}
          >
            {mutation.isPending ? (
              <ActivityIndicator size="small" color={colors.fg.primary} />
            ) : (
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={colors.fg.primary} strokeWidth={2}>
                <Path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            )}
          </Pressable>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  commentsHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md },
  commentsTitle: { fontSize: typography.sizes.base, fontWeight: typography.weights.semibold, color: colors.fg.primary },
  commentsCount: { fontSize: typography.sizes.sm, color: colors.fg.tertiary },
  loader: { padding: spacing.md },
  emptyText: { fontSize: typography.sizes.sm, color: colors.fg.tertiary, textAlign: 'center', padding: spacing.lg },
  commentItem: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  commentAvatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.cream10, alignItems: 'center', justifyContent: 'center' },
  commentAvatarText: { fontSize: 11, fontWeight: typography.weights.semibold, color: colors.fg.primary },
  commentBody: { flex: 1 },
  commentHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: 2 },
  commentUser: { fontSize: typography.sizes.sm, fontWeight: typography.weights.semibold, color: colors.fg.primary },
  commentTime: { fontSize: 11, color: colors.fg.muted },
  commentText: { fontSize: typography.sizes.sm, color: colors.fg.secondary, lineHeight: 18 },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border.default, paddingTop: spacing.sm },
  input: { flex: 1, backgroundColor: colors.bg.card, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border.default, paddingHorizontal: spacing.sm, paddingVertical: spacing.sm, fontSize: typography.sizes.sm, color: colors.fg.primary, maxHeight: 100 },
  sendButton: { padding: spacing.sm },
  sendButtonDisabled: { opacity: 0.3 },
});
