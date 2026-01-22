'use client';

import { useState } from 'react';

interface ModerationPost {
  id: string;
  caption: string | null;
  mediaUrl: string;
  mediaType: string;
  thumbnailUrl: string | null;
  createdAt: string;
  consentGiven: boolean;
  user: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
  };
  studio: {
    id: string;
    name: string;
    city: string;
  } | null;
  tags: {
    tag: {
      id: string;
      name: string;
      slug: string;
    };
  }[];
}

interface ModerationCardProps {
  post: ModerationPost;
  onModerate: (postId: string, action: 'approve' | 'reject', feature?: boolean, note?: string) => Promise<void>;
}

export function ModerationCard({ post, onModerate }: ModerationCardProps) {
  const [moderating, setModerating] = useState(false);
  const [note, setNote] = useState('');
  const [feature, setFeature] = useState(false);
  const [showRejectForm, setShowRejectForm] = useState(false);

  const userName = post.user.firstName && post.user.lastName
    ? `${post.user.firstName} ${post.user.lastName}`
    : post.user.firstName || 'Anonymous';

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleApprove = async () => {
    setModerating(true);
    try {
      await onModerate(post.id, 'approve', feature);
    } finally {
      setModerating(false);
    }
  };

  const handleReject = async () => {
    setModerating(true);
    try {
      await onModerate(post.id, 'reject', false, note);
    } finally {
      setModerating(false);
      setShowRejectForm(false);
      setNote('');
    }
  };

  return (
    <div
      style={{
        background: 'rgba(246, 237, 221, 0.03)',
        borderRadius: '4px',
        overflow: 'hidden',
        border: '1px solid rgba(246, 237, 221, 0.1)',
      }}
    >
      {/* Media */}
      <div
        style={{
          position: 'relative',
          maxHeight: '400px',
          overflow: 'hidden',
          background: '#000',
        }}
      >
        {post.mediaType === 'video' ? (
          <video
            src={post.mediaUrl}
            poster={post.thumbnailUrl || undefined}
            controls
            style={{
              width: '100%',
              maxHeight: '400px',
              objectFit: 'contain',
            }}
          />
        ) : (
          <img
            src={post.mediaUrl}
            alt="Post media"
            style={{
              width: '100%',
              maxHeight: '400px',
              objectFit: 'contain',
            }}
          />
        )}
      </div>

      {/* Info */}
      <div style={{ padding: '1rem' }}>
        {/* User info */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '0.75rem',
          }}
        >
          <div>
            <p style={{ margin: 0, color: '#f6eddd', fontWeight: 500 }}>
              {userName}
            </p>
            <p
              style={{
                margin: '2px 0 0',
                fontSize: '0.75rem',
                color: 'rgba(246, 237, 221, 0.5)',
              }}
            >
              {post.user.email}
            </p>
          </div>
          <p
            style={{
              margin: 0,
              fontSize: '0.75rem',
              color: 'rgba(246, 237, 221, 0.4)',
            }}
          >
            {formatDate(post.createdAt)}
          </p>
        </div>

        {/* Caption */}
        {post.caption && (
          <p
            style={{
              margin: '0 0 0.75rem',
              color: 'rgba(246, 237, 221, 0.85)',
              fontSize: '0.875rem',
            }}
          >
            {post.caption}
          </p>
        )}

        {/* Studio */}
        {post.studio && (
          <p
            style={{
              margin: '0 0 0.5rem',
              fontSize: '0.8rem',
              color: 'rgba(246, 237, 221, 0.6)',
            }}
          >
            Tagged: {post.studio.name}, {post.studio.city}
          </p>
        )}

        {/* Tags */}
        {post.tags.length > 0 && (
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '6px',
              marginBottom: '0.75rem',
            }}
          >
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

        {/* Consent */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            marginBottom: '1rem',
            fontSize: '0.75rem',
            color: post.consentGiven ? '#22c55e' : '#ef4444',
          }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            {post.consentGiven ? (
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14M22 4 12 14.01l-3-3" />
            ) : (
              <path d="M10 15L15 10M10 10L15 15M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
            )}
          </svg>
          {post.consentGiven ? 'Consent given' : 'No consent'}
        </div>

        {/* Actions */}
        {showRejectForm ? (
          <div>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Reason for rejection (optional)..."
              style={{
                width: '100%',
                minHeight: '60px',
                padding: '8px 12px',
                background: 'rgba(246, 237, 221, 0.05)',
                border: '1px solid rgba(246, 237, 221, 0.1)',
                borderRadius: '2px',
                color: '#f6eddd',
                fontSize: '0.875rem',
                resize: 'vertical',
                marginBottom: '12px',
              }}
            />
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="button"
                onClick={() => setShowRejectForm(false)}
                disabled={moderating}
                style={{
                  flex: 1,
                  padding: '8px 16px',
                  background: 'rgba(246, 237, 221, 0.1)',
                  border: 'none',
                  borderRadius: '2px',
                  color: '#f6eddd',
                  cursor: moderating ? 'not-allowed' : 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReject}
                disabled={moderating}
                style={{
                  flex: 1,
                  padding: '8px 16px',
                  background: '#ef4444',
                  border: 'none',
                  borderRadius: '2px',
                  color: '#fff',
                  fontWeight: 500,
                  cursor: moderating ? 'not-allowed' : 'pointer',
                }}
              >
                {moderating ? '...' : 'Confirm Reject'}
              </button>
            </div>
          </div>
        ) : (
          <div>
            {/* Feature toggle */}
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '12px',
                cursor: 'pointer',
              }}
            >
              <input
                type="checkbox"
                checked={feature}
                onChange={(e) => setFeature(e.target.checked)}
                style={{ accentColor: '#f59e0b' }}
              />
              <span style={{ fontSize: '0.875rem', color: 'rgba(246, 237, 221, 0.8)' }}>
                Feature this post
              </span>
            </label>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="button"
                onClick={() => setShowRejectForm(true)}
                disabled={moderating}
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '2px',
                  color: '#ef4444',
                  cursor: moderating ? 'not-allowed' : 'pointer',
                }}
              >
                Reject
              </button>
              <button
                type="button"
                onClick={handleApprove}
                disabled={moderating}
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  background: '#22c55e',
                  border: 'none',
                  borderRadius: '2px',
                  color: '#fff',
                  fontWeight: 500,
                  cursor: moderating ? 'not-allowed' : 'pointer',
                }}
              >
                {moderating ? '...' : 'Approve'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
