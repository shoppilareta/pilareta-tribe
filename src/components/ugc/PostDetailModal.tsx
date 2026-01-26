'use client';

import { useEffect, useState, useCallback } from 'react';
import { usePost, type UgcComment } from './hooks/usePost';
import type { UgcPost } from './hooks/useFeed';
import { LikeButton } from './LikeButton';
import { SaveButton } from './SaveButton';
import { ShareButton } from './ShareButton';
import { CommentSection } from './CommentSection';
import { InstagramEmbed } from './InstagramEmbed';
import { WorkoutRecapCard } from './WorkoutRecapCard';

interface PostDetailModalProps {
  postId: string | null;
  onClose: () => void;
  onInteraction?: (postId: string, updates: Partial<UgcPost>) => void;
  isLoggedIn: boolean;
  onLoginRequired: () => void;
}

export function PostDetailModal({
  postId,
  onClose,
  onInteraction,
  isLoggedIn,
  onLoginRequired,
}: PostDetailModalProps) {
  const { post, loading, fetchPost, likePost, unlikePost, savePost, unsavePost, addComment, deletePost } = usePost();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (postId) {
      fetchPost(postId);
    }
  }, [postId, fetchPost]);

  // Close on escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleLike = useCallback(async () => {
    if (!isLoggedIn) {
      onLoginRequired();
      return;
    }
    if (!post) return;

    const result = post.isLiked
      ? await unlikePost(post.id)
      : await likePost(post.id);

    if (result.success && onInteraction) {
      onInteraction(post.id, {
        isLiked: result.liked,
        likesCount: post.likesCount + (result.liked ? 1 : -1),
      });
    }
  }, [isLoggedIn, onLoginRequired, post, likePost, unlikePost, onInteraction]);

  const handleSave = useCallback(async () => {
    if (!isLoggedIn) {
      onLoginRequired();
      return;
    }
    if (!post) return;

    const result = post.isSaved
      ? await unsavePost(post.id)
      : await savePost(post.id);

    if (result.success && onInteraction) {
      onInteraction(post.id, {
        isSaved: result.saved,
        savesCount: post.savesCount + (result.saved ? 1 : -1),
      });
    }
  }, [isLoggedIn, onLoginRequired, post, savePost, unsavePost, onInteraction]);

  const handleAddComment = useCallback(
    async (content: string) => {
      if (!isLoggedIn) {
        onLoginRequired();
        return { success: false, error: 'Login required' };
      }
      if (!post) return { success: false, error: 'Post not found' };

      const result = await addComment(post.id, content);
      if (result.success && onInteraction) {
        onInteraction(post.id, {
          commentsCount: post.commentsCount + 1,
        });
      }
      return result;
    },
    [isLoggedIn, onLoginRequired, post, addComment, onInteraction]
  );

  const handleDelete = useCallback(async () => {
    if (!post) return;
    const result = await deletePost(post.id);
    if (result.success) {
      onClose();
    }
  }, [post, deletePost, onClose]);

  if (!postId) return null;

  const userName =
    post?.user.firstName && post?.user.lastName
      ? `${post.user.firstName} ${post.user.lastName}`
      : post?.user.firstName || 'Anonymous';

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.9)',
        }}
      />

      {/* Modal */}
      <div
        style={{
          position: 'relative',
          background: '#1a1a1a',
          borderRadius: '4px',
          maxWidth: '1000px',
          maxHeight: '90vh',
          width: '100%',
          display: 'flex',
          flexDirection: 'row',
          overflow: 'hidden',
        }}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            zIndex: 10,
            background: 'rgba(0, 0, 0, 0.5)',
            border: 'none',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#f6eddd',
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {loading ? (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              width: '100%',
              padding: '4rem',
            }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                border: '2px solid rgba(246, 237, 221, 0.2)',
                borderTopColor: '#f6eddd',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
              }}
            />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : post ? (
          <>
            {/* Media section */}
            <div
              style={{
                flex: '1 1 60%',
                maxWidth: '60%',
                background: '#000',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: post.mediaType === 'instagram' ? '1rem' : 0,
              }}
            >
              {/* Workout Recap without image - show styled recap card */}
              {post.postType === 'workout_recap' && !post.mediaUrl && post.workoutRecap ? (
                <WorkoutRecapCard
                  recap={post.workoutRecap}
                  userName={userName}
                  studioName={post.studio?.name}
                  size="full"
                />
              ) : post.mediaType === 'instagram' && post.instagramUrl ? (
                <InstagramEmbed url={post.instagramUrl} postId={post.instagramPostId} maxWidth={500} />
              ) : post.mediaType === 'video' ? (
                <video
                  src={post.mediaUrl || ''}
                  poster={post.thumbnailUrl || undefined}
                  controls
                  style={{
                    maxWidth: '100%',
                    maxHeight: '85vh',
                    objectFit: 'contain',
                  }}
                />
              ) : (
                <img
                  src={post.mediaUrl || ''}
                  alt={post.caption || 'Post'}
                  style={{
                    maxWidth: '100%',
                    maxHeight: '85vh',
                    objectFit: 'contain',
                  }}
                />
              )}
            </div>

            {/* Info section */}
            <div
              style={{
                flex: '1 1 40%',
                maxWidth: '40%',
                display: 'flex',
                flexDirection: 'column',
                borderLeft: '1px solid rgba(246, 237, 221, 0.1)',
              }}
            >
              {/* Header */}
              <div
                style={{
                  padding: '1rem',
                  borderBottom: '1px solid rgba(246, 237, 221, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <p
                    style={{
                      margin: 0,
                      fontWeight: 500,
                      color: '#f6eddd',
                    }}
                  >
                    {userName}
                  </p>
                  {post.studio && (
                    <p
                      style={{
                        margin: '2px 0 0',
                        fontSize: '0.8rem',
                        color: 'rgba(246, 237, 221, 0.6)',
                      }}
                    >
                      at {post.studio.name}, {post.studio.city}
                    </p>
                  )}
                </div>

                {/* Delete button for owner */}
                {post.isOwner && (
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(true)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'rgba(246, 237, 221, 0.4)',
                      cursor: 'pointer',
                      padding: '4px',
                    }}
                    title="Delete post"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Caption & Tags */}
              <div
                style={{
                  padding: '1rem',
                  borderBottom: '1px solid rgba(246, 237, 221, 0.1)',
                }}
              >
                {post.caption && (
                  <p
                    style={{
                      margin: '0 0 0.75rem',
                      color: 'rgba(246, 237, 221, 0.9)',
                      lineHeight: 1.5,
                    }}
                  >
                    {post.caption}
                  </p>
                )}

                {post.tags && post.tags.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {post.tags.map(({ tag }) => (
                      <span
                        key={tag.id}
                        style={{
                          fontSize: '0.75rem',
                          color: 'rgba(246, 237, 221, 0.6)',
                          background: 'rgba(246, 237, 221, 0.1)',
                          padding: '2px 8px',
                          borderRadius: '2px',
                        }}
                      >
                        #{tag.name}
                      </span>
                    ))}
                  </div>
                )}

                <p
                  style={{
                    margin: '0.75rem 0 0',
                    fontSize: '0.75rem',
                    color: 'rgba(246, 237, 221, 0.4)',
                  }}
                >
                  {formatDate(post.createdAt)}
                </p>
              </div>

              {/* Actions */}
              <div
                style={{
                  padding: '0.75rem 1rem',
                  borderBottom: '1px solid rgba(246, 237, 221, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                }}
              >
                <LikeButton
                  isLiked={post.isLiked}
                  count={post.likesCount}
                  onClick={handleLike}
                />
                <SaveButton
                  isSaved={post.isSaved}
                  count={post.savesCount}
                  onClick={handleSave}
                />
                <ShareButton
                  postId={post.id}
                />
              </div>

              {/* Comments */}
              <div style={{ flex: 1, overflow: 'auto' }}>
                <CommentSection
                  comments={post.comments || []}
                  onAddComment={handleAddComment}
                  isLoggedIn={isLoggedIn}
                />
              </div>
            </div>
          </>
        ) : (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              width: '100%',
              padding: '4rem',
              color: 'rgba(246, 237, 221, 0.6)',
            }}
          >
            Post not found
          </div>
        )}
      </div>

      {/* Delete confirmation */}
      {showDeleteConfirm && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 1001,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0, 0, 0, 0.8)',
          }}
        >
          <div
            style={{
              background: '#1a1a1a',
              padding: '1.5rem',
              borderRadius: '4px',
              textAlign: 'center',
              maxWidth: '300px',
            }}
          >
            <p style={{ margin: '0 0 1rem', color: '#f6eddd' }}>
              Are you sure you want to delete this post?
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                style={{
                  padding: '8px 16px',
                  background: 'rgba(246, 237, 221, 0.1)',
                  border: 'none',
                  borderRadius: '2px',
                  color: '#f6eddd',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                style={{
                  padding: '8px 16px',
                  background: '#ef4444',
                  border: 'none',
                  borderRadius: '2px',
                  color: '#fff',
                  cursor: 'pointer',
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
