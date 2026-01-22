'use client';

import { useEffect, useRef, useCallback } from 'react';
import { PostCard } from './PostCard';
import type { UgcPost } from './hooks/useFeed';

interface PostGridProps {
  posts: UgcPost[];
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  onPostClick: (post: UgcPost) => void;
}

export function PostGrid({
  posts,
  loading,
  loadingMore,
  hasMore,
  onLoadMore,
  onPostClick,
}: PostGridProps) {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const target = entries[0];
      if (target.isIntersecting && hasMore && !loadingMore) {
        onLoadMore();
      }
    },
    [hasMore, loadingMore, onLoadMore]
  );

  useEffect(() => {
    observerRef.current = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin: '200px',
      threshold: 0,
    });

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [handleObserver]);

  if (loading && posts.length === 0) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '3rem',
          color: 'rgba(246, 237, 221, 0.6)',
        }}
      >
        <div
          style={{
            width: '24px',
            height: '24px',
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

  if (!loading && posts.length === 0) {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: '3rem',
          color: 'rgba(246, 237, 221, 0.6)',
        }}
      >
        <svg
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          style={{ margin: '0 auto 1rem', opacity: 0.5 }}
        >
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
        <p style={{ margin: 0 }}>No posts yet. Be the first to share!</p>
      </div>
    );
  }

  return (
    <div>
      {/* Masonry Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '16px',
          padding: '1rem',
        }}
      >
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onClick={() => onPostClick(post)}
          />
        ))}
      </div>

      {/* Load more trigger */}
      <div ref={loadMoreRef} style={{ height: '1px' }} />

      {/* Loading indicator */}
      {loadingMore && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            padding: '2rem',
          }}
        >
          <div
            style={{
              width: '24px',
              height: '24px',
              border: '2px solid rgba(246, 237, 221, 0.2)',
              borderTopColor: '#f6eddd',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
            }}
          />
        </div>
      )}

      {/* End of feed */}
      {!hasMore && posts.length > 0 && (
        <div
          style={{
            textAlign: 'center',
            padding: '2rem',
            color: 'rgba(246, 237, 221, 0.4)',
            fontSize: '0.875rem',
          }}
        >
          You&apos;ve seen all the posts
        </div>
      )}
    </div>
  );
}
