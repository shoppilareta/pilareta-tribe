'use client';

import { useState, useEffect, useCallback } from 'react';
import { ModerationCard } from './ModerationCard';

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

export function ModerationQueue() {
  const [posts, setPosts] = useState<ModerationPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPending, setTotalPending] = useState(0);

  const fetchPending = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/ugc/admin/pending');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch pending posts');
      }

      setPosts(data.posts);
      setTotalPending(data.totalPending);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPending();
  }, [fetchPending]);

  const handleModerate = useCallback(
    async (postId: string, action: 'approve' | 'reject', feature?: boolean, note?: string) => {
      try {
        const response = await fetch(`/api/ugc/admin/moderate/${postId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action, feature, note }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to moderate post');
        }

        // Remove from list
        setPosts((prev) => prev.filter((p) => p.id !== postId));
        setTotalPending((prev) => Math.max(0, prev - 1));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to moderate post');
      }
    },
    []
  );

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
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
    );
  }

  return (
    <div>
      {/* Stats */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.5rem',
        }}
      >
        <p style={{ margin: 0, color: 'rgba(246, 237, 221, 0.8)' }}>
          <span
            style={{
              fontSize: '1.5rem',
              fontWeight: 500,
              color: '#f6eddd',
              marginRight: '8px',
            }}
          >
            {totalPending}
          </span>
          posts pending review
        </p>
        <button
          type="button"
          onClick={fetchPending}
          style={{
            padding: '8px 16px',
            background: 'rgba(246, 237, 221, 0.1)',
            border: 'none',
            borderRadius: '2px',
            color: '#f6eddd',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M23 4v6h-6M1 20v-6h6M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Error */}
      {error && (
        <div
          style={{
            padding: '12px 16px',
            background: 'rgba(239, 68, 68, 0.1)',
            borderRadius: '4px',
            color: '#ef4444',
            marginBottom: '1.5rem',
          }}
        >
          {error}
        </div>
      )}

      {/* Empty state */}
      {posts.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '4rem 2rem',
            background: 'rgba(246, 237, 221, 0.03)',
            borderRadius: '4px',
          }}
        >
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="rgba(246, 237, 221, 0.3)"
            strokeWidth="1.5"
            style={{ margin: '0 auto 1rem' }}
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          <p style={{ margin: 0, color: 'rgba(246, 237, 221, 0.6)' }}>
            No posts pending review
          </p>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
            gap: '1.5rem',
          }}
        >
          {posts.map((post) => (
            <ModerationCard
              key={post.id}
              post={post}
              onModerate={handleModerate}
            />
          ))}
        </div>
      )}
    </div>
  );
}
