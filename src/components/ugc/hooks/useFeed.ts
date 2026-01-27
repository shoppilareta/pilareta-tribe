'use client';

import { useState, useCallback, useEffect } from 'react';

export interface UgcUser {
  id: string;
  firstName: string | null;
  lastName: string | null;
  displayName?: string;
  isAdmin?: boolean;
}

export interface UgcStudio {
  id: string;
  name: string;
  city: string;
}

export interface UgcTag {
  id: string;
  name: string;
  slug: string;
}

export interface WorkoutRecap {
  id: string;
  workoutDate: string;
  durationMinutes: number;
  workoutType: string;
  rpe: number;
  calorieEstimate: number | null;
  focusAreas: string[];
  imageUrl: string | null;
}

export interface UgcPost {
  id: string;
  userId: string;
  user: UgcUser;
  caption: string | null;
  mediaUrl: string | null;
  mediaType: 'image' | 'video' | 'instagram';
  thumbnailUrl: string | null;
  aspectRatio: number | null;
  fileSizeBytes: number | null;
  durationSeconds: number | null;
  // Instagram embed fields
  instagramUrl: string | null;
  instagramPostId: string | null;
  studio: UgcStudio | null;
  status: string;
  isFeatured: boolean;
  likesCount: number;
  commentsCount: number;
  savesCount: number;
  createdAt: string;
  tags: { tag: UgcTag }[];
  _count: {
    likes: number;
    comments: number;
    saves: number;
  };
  isLiked: boolean;
  isSaved: boolean;
  isOwner?: boolean;
  // Workout recap data
  postType?: 'general' | 'workout_recap';
  workoutRecap?: WorkoutRecap | null;
}

interface UseFeedOptions {
  tag?: string;
  studioId?: string;
  limit?: number;
}

export function useFeed(options: UseFeedOptions = {}) {
  const [posts, setPosts] = useState<UgcPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);

  const fetchPosts = useCallback(
    async (cursor?: string) => {
      try {
        const isLoadMore = !!cursor;
        if (isLoadMore) {
          setLoadingMore(true);
        } else {
          setLoading(true);
        }
        setError(null);

        const params = new URLSearchParams();
        if (cursor) params.append('cursor', cursor);
        if (options.limit) params.append('limit', String(options.limit));
        if (options.tag) params.append('tag', options.tag);
        if (options.studioId) params.append('studioId', options.studioId);

        const response = await fetch(`/api/ugc/posts?${params}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch posts');
        }

        if (isLoadMore) {
          setPosts((prev) => [...prev, ...data.posts]);
        } else {
          setPosts(data.posts);
        }
        setHasMore(data.hasMore);
        setNextCursor(data.nextCursor);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [options.tag, options.studioId, options.limit]
  );

  const loadMore = useCallback(() => {
    if (nextCursor && !loadingMore) {
      fetchPosts(nextCursor);
    }
  }, [nextCursor, loadingMore, fetchPosts]);

  const refresh = useCallback(() => {
    setNextCursor(null);
    fetchPosts();
  }, [fetchPosts]);

  const updatePostInteraction = useCallback(
    (postId: string, updates: Partial<Pick<UgcPost, 'isLiked' | 'isSaved' | 'likesCount' | 'savesCount'>>) => {
      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId ? { ...post, ...updates } : post
        )
      );
    },
    []
  );

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return {
    posts,
    loading,
    loadingMore,
    error,
    hasMore,
    loadMore,
    refresh,
    updatePostInteraction,
  };
}
