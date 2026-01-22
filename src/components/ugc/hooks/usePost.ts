'use client';

import { useState, useCallback } from 'react';
import type { UgcPost, UgcUser } from './useFeed';

export interface UgcComment {
  id: string;
  postId: string;
  userId: string;
  user: UgcUser;
  content: string;
  createdAt: string;
}

export interface PostWithComments extends UgcPost {
  comments: UgcComment[];
}

export function usePost() {
  const [post, setPost] = useState<PostWithComments | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPost = useCallback(async (postId: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/ugc/posts/${postId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch post');
      }

      setPost(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const likePost = useCallback(async (postId: string) => {
    try {
      const response = await fetch(`/api/ugc/posts/${postId}/like`, {
        method: 'POST',
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to like post');
      }

      setPost((prev) =>
        prev
          ? {
              ...prev,
              isLiked: true,
              likesCount: prev.likesCount + 1,
            }
          : prev
      );

      return { success: true, liked: true };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'An error occurred' };
    }
  }, []);

  const unlikePost = useCallback(async (postId: string) => {
    try {
      const response = await fetch(`/api/ugc/posts/${postId}/like`, {
        method: 'DELETE',
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to unlike post');
      }

      setPost((prev) =>
        prev
          ? {
              ...prev,
              isLiked: false,
              likesCount: Math.max(0, prev.likesCount - 1),
            }
          : prev
      );

      return { success: true, liked: false };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'An error occurred' };
    }
  }, []);

  const savePost = useCallback(async (postId: string) => {
    try {
      const response = await fetch(`/api/ugc/posts/${postId}/save`, {
        method: 'POST',
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save post');
      }

      setPost((prev) =>
        prev
          ? {
              ...prev,
              isSaved: true,
              savesCount: prev.savesCount + 1,
            }
          : prev
      );

      return { success: true, saved: true };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'An error occurred' };
    }
  }, []);

  const unsavePost = useCallback(async (postId: string) => {
    try {
      const response = await fetch(`/api/ugc/posts/${postId}/save`, {
        method: 'DELETE',
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to unsave post');
      }

      setPost((prev) =>
        prev
          ? {
              ...prev,
              isSaved: false,
              savesCount: Math.max(0, prev.savesCount - 1),
            }
          : prev
      );

      return { success: true, saved: false };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'An error occurred' };
    }
  }, []);

  const addComment = useCallback(async (postId: string, content: string) => {
    try {
      const response = await fetch(`/api/ugc/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add comment');
      }

      setPost((prev) =>
        prev
          ? {
              ...prev,
              comments: [data.comment, ...prev.comments],
              commentsCount: prev.commentsCount + 1,
            }
          : prev
      );

      return { success: true, comment: data.comment };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'An error occurred' };
    }
  }, []);

  const deletePost = useCallback(async (postId: string) => {
    try {
      const response = await fetch(`/api/ugc/posts/${postId}`, {
        method: 'DELETE',
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete post');
      }

      setPost(null);
      return { success: true };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'An error occurred' };
    }
  }, []);

  return {
    post,
    loading,
    error,
    fetchPost,
    likePost,
    unlikePost,
    savePost,
    unsavePost,
    addComment,
    deletePost,
    setPost,
  };
}
