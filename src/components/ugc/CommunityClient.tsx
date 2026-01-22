'use client';

import { useState, useCallback, useEffect } from 'react';
import { useFeed, type UgcPost } from './hooks/useFeed';
import { FeaturedSection } from './FeaturedSection';
import { FilterBar } from './FilterBar';
import { PostGrid } from './PostGrid';
import { PostDetailModal } from './PostDetailModal';
import { UploadModal } from './UploadModal';

interface CommunityClientProps {
  isLoggedIn: boolean;
  initialPostId?: string;
}

export function CommunityClient({ isLoggedIn, initialPostId }: CommunityClientProps) {
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(initialPostId || null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const { posts, loading, loadingMore, hasMore, loadMore, refresh, updatePostInteraction } = useFeed({
    tag: selectedTag || undefined,
  });

  // Handle URL changes for post deep linking
  useEffect(() => {
    if (selectedPostId) {
      window.history.replaceState(null, '', `/ugc?post=${selectedPostId}`);
    } else {
      window.history.replaceState(null, '', '/ugc');
    }
  }, [selectedPostId]);

  const handlePostClick = useCallback((post: UgcPost) => {
    setSelectedPostId(post.id);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setSelectedPostId(null);
  }, []);

  const handleTagChange = useCallback((tagSlug: string | null) => {
    setSelectedTag(tagSlug);
  }, []);

  const handleShareClick = useCallback(() => {
    if (!isLoggedIn) {
      setShowLoginPrompt(true);
      return;
    }
    setShowUploadModal(true);
  }, [isLoggedIn]);

  const handleUploadSuccess = useCallback(() => {
    setShowUploadModal(false);
    refresh();
  }, [refresh]);

  const handleLoginRequired = useCallback(() => {
    setShowLoginPrompt(true);
  }, []);

  const handleInteraction = useCallback(
    (postId: string, updates: Partial<UgcPost>) => {
      updatePostInteraction(postId, updates);
    },
    [updatePostInteraction]
  );

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 4rem)',
        background: '#1a1a1a',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '1.5rem 1rem',
          borderBottom: '1px solid rgba(246, 237, 221, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: '1.5rem',
              fontWeight: 400,
              color: '#f6eddd',
              letterSpacing: '-0.02em',
            }}
          >
            Community
          </h1>
          <p
            style={{
              margin: '0.25rem 0 0',
              fontSize: '0.875rem',
              color: 'rgba(246, 237, 221, 0.6)',
            }}
          >
            Share your Pilates journey with the tribe
          </p>
        </div>

        <button
          type="button"
          onClick={handleShareClick}
          style={{
            padding: '10px 20px',
            background: '#f6eddd',
            border: 'none',
            borderRadius: '2px',
            color: '#1a1a1a',
            fontSize: '0.875rem',
            fontWeight: 500,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Share
        </button>
      </div>

      {/* Featured Section */}
      <FeaturedSection onPostClick={handlePostClick} />

      {/* Filter Bar */}
      <FilterBar selectedTag={selectedTag} onTagChange={handleTagChange} />

      {/* Post Grid */}
      <PostGrid
        posts={posts}
        loading={loading}
        loadingMore={loadingMore}
        hasMore={hasMore}
        onLoadMore={loadMore}
        onPostClick={handlePostClick}
      />

      {/* Post Detail Modal */}
      <PostDetailModal
        postId={selectedPostId}
        onClose={handleCloseDetail}
        onInteraction={handleInteraction}
        isLoggedIn={isLoggedIn}
        onLoginRequired={handleLoginRequired}
      />

      {/* Upload Modal */}
      {showUploadModal && (
        <UploadModal onClose={() => setShowUploadModal(false)} onSuccess={handleUploadSuccess} />
      )}

      {/* Login Prompt */}
      {showLoginPrompt && (
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
          <div
            onClick={() => setShowLoginPrompt(false)}
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.9)',
            }}
          />
          <div
            style={{
              position: 'relative',
              background: '#1a1a1a',
              borderRadius: '4px',
              padding: '2rem',
              maxWidth: '400px',
              textAlign: 'center',
            }}
          >
            <h3
              style={{
                margin: '0 0 0.75rem',
                color: '#f6eddd',
                fontSize: '1.125rem',
                fontWeight: 500,
              }}
            >
              Join the Tribe
            </h3>
            <p
              style={{
                margin: '0 0 1.5rem',
                color: 'rgba(246, 237, 221, 0.7)',
                fontSize: '0.875rem',
              }}
            >
              Log in to share posts, like, comment, and save your favorites.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                type="button"
                onClick={() => setShowLoginPrompt(false)}
                style={{
                  padding: '10px 20px',
                  background: 'rgba(246, 237, 221, 0.1)',
                  border: 'none',
                  borderRadius: '2px',
                  color: '#f6eddd',
                  cursor: 'pointer',
                }}
              >
                Maybe Later
              </button>
              <a
                href="/api/auth/login"
                style={{
                  padding: '10px 20px',
                  background: '#f6eddd',
                  border: 'none',
                  borderRadius: '2px',
                  color: '#1a1a1a',
                  fontWeight: 500,
                  textDecoration: 'none',
                  display: 'inline-block',
                }}
              >
                Log In
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
