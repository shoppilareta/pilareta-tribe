'use client';

import { useState } from 'react';
import type { UgcComment } from './hooks/usePost';

interface CommentSectionProps {
  comments: UgcComment[];
  onAddComment: (content: string) => Promise<{ success: boolean; error?: string }>;
  isLoggedIn: boolean;
}

export function CommentSection({ comments, onAddComment, isLoggedIn }: CommentSectionProps) {
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || submitting) return;

    setSubmitting(true);
    setError(null);

    const result = await onAddComment(newComment.trim());

    if (result.success) {
      setNewComment('');
    } else {
      setError(result.error || 'Failed to add comment');
    }

    setSubmitting(false);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Comments list */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '1rem',
        }}
      >
        {comments.length === 0 ? (
          <p
            style={{
              textAlign: 'center',
              color: 'rgba(246, 237, 221, 0.4)',
              fontSize: '0.875rem',
              margin: '2rem 0',
            }}
          >
            No comments yet. Be the first to comment!
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {comments.map((comment) => {
              const userName =
                comment.user.firstName && comment.user.lastName
                  ? `${comment.user.firstName} ${comment.user.lastName}`
                  : comment.user.firstName || 'Anonymous';

              return (
                <div key={comment.id}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                    <span
                      style={{
                        fontWeight: 500,
                        color: '#f6eddd',
                        fontSize: '0.875rem',
                      }}
                    >
                      {userName}
                    </span>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        color: 'rgba(246, 237, 221, 0.4)',
                      }}
                    >
                      {formatTime(comment.createdAt)}
                    </span>
                  </div>
                  <p
                    style={{
                      margin: '4px 0 0',
                      color: 'rgba(246, 237, 221, 0.85)',
                      fontSize: '0.875rem',
                      lineHeight: 1.4,
                    }}
                  >
                    {comment.content}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Comment input */}
      <div
        style={{
          padding: '0.75rem 1rem',
          borderTop: '1px solid rgba(246, 237, 221, 0.1)',
        }}
      >
        {error && (
          <p
            style={{
              margin: '0 0 8px',
              fontSize: '0.75rem',
              color: '#ef4444',
            }}
          >
            {error}
          </p>
        )}

        {isLoggedIn ? (
          <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              maxLength={1000}
              style={{
                flex: 1,
                padding: '8px 12px',
                background: 'rgba(246, 237, 221, 0.05)',
                border: '1px solid rgba(246, 237, 221, 0.1)',
                borderRadius: '2px',
                color: '#f6eddd',
                fontSize: '0.875rem',
                outline: 'none',
              }}
            />
            <button
              type="submit"
              disabled={!newComment.trim() || submitting}
              style={{
                padding: '8px 16px',
                background:
                  !newComment.trim() || submitting
                    ? 'rgba(246, 237, 221, 0.1)'
                    : '#f6eddd',
                border: 'none',
                borderRadius: '2px',
                color: !newComment.trim() || submitting ? 'rgba(246, 237, 221, 0.4)' : '#1a1a1a',
                fontSize: '0.875rem',
                fontWeight: 500,
                cursor: !newComment.trim() || submitting ? 'not-allowed' : 'pointer',
              }}
            >
              {submitting ? '...' : 'Post'}
            </button>
          </form>
        ) : (
          <p
            style={{
              margin: 0,
              fontSize: '0.875rem',
              color: 'rgba(246, 237, 221, 0.6)',
              textAlign: 'center',
            }}
          >
            <a
              href="/api/auth/login"
              style={{ color: '#f59e0b', textDecoration: 'none' }}
            >
              Log in
            </a>{' '}
            to add a comment
          </p>
        )}
      </div>
    </div>
  );
}
