'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
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
  const [activeFeed, setActiveFeed] = useState<'discover' | 'following' | 'my-posts'>('discover');
  const [searchQuery, setSearchQuery] = useState('');

  // My Posts state (separate from the main feed)
  const [myPosts, setMyPosts] = useState<UgcPost[]>([]);
  const [myPostsLoading, setMyPostsLoading] = useState(false);
  const [myPostsHasMore, setMyPostsHasMore] = useState(false);
  const [myPostsCursor, setMyPostsCursor] = useState<string | null>(null);
  const [myPostsLoadingMore, setMyPostsLoadingMore] = useState(false);

  const { posts, loading, loadingMore, hasMore, loadMore, refresh, updatePostInteraction } = useFeed({
    tag: selectedTag || undefined,
    feed: activeFeed === 'following' ? 'following' : undefined,
  });

  // Fetch my posts when tab is active
  const fetchMyPosts = useCallback(async (cursor?: string) => {
    const isLoadMore = !!cursor;
    if (isLoadMore) {
      setMyPostsLoadingMore(true);
    } else {
      setMyPostsLoading(true);
    }
    try {
      const params = new URLSearchParams();
      if (cursor) params.append('cursor', cursor);
      const response = await fetch(`/api/ugc/my-posts?${params}`);
      const data = await response.json();
      if (response.ok) {
        if (isLoadMore) {
          setMyPosts((prev) => [...prev, ...data.posts]);
        } else {
          setMyPosts(data.posts);
        }
        setMyPostsHasMore(data.hasMore);
        setMyPostsCursor(data.nextCursor);
      }
    } catch {
      // silently fail
    } finally {
      setMyPostsLoading(false);
      setMyPostsLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    if (activeFeed === 'my-posts' && isLoggedIn) {
      fetchMyPosts();
    }
  }, [activeFeed, isLoggedIn, fetchMyPosts]);

  const loadMoreMyPosts = useCallback(() => {
    if (myPostsCursor && !myPostsLoadingMore) {
      fetchMyPosts(myPostsCursor);
    }
  }, [myPostsCursor, myPostsLoadingMore, fetchMyPosts]);

  // Client-side search filtering
  const filteredPosts = useMemo(() => {
    const source = activeFeed === 'my-posts' ? myPosts : posts;
    if (!searchQuery.trim()) return source;
    const q = searchQuery.toLowerCase();
    return source.filter(
      (post) => post.caption && post.caption.toLowerCase().includes(q)
    );
  }, [posts, myPosts, activeFeed, searchQuery]);

  // Handle URL changes for post deep linking
  useEffect(() => {
    if (selectedPostId) {
      window.history.replaceState(null, '', `/community?post=${selectedPostId}`);
    } else {
      window.history.replaceState(null, '', '/community');
    }
  }, [selectedPostId]);

  // Close login prompt on Escape key
  useEffect(() => {
    if (!showLoginPrompt) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowLoginPrompt(false);
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [showLoginPrompt]);

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

      {/* Search Bar */}
      <div
        style={{
          padding: '0.75rem 1rem',
          borderBottom: '1px solid rgba(246, 237, 221, 0.1)',
        }}
      >
        <div style={{ position: 'relative' }}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="rgba(246, 237, 221, 0.5)"
            strokeWidth="2"
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
            }}
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search posts by caption..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px 10px 36px',
              paddingRight: searchQuery ? '36px' : '12px',
              background: 'rgba(246, 237, 221, 0.05)',
              border: '1px solid rgba(246, 237, 221, 0.1)',
              borderRadius: '2px',
              color: '#f6eddd',
              fontSize: '0.875rem',
              outline: 'none',
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '1.4rem',
                height: '1.4rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                background: 'rgba(246, 237, 221, 0.15)',
                border: 'none',
                cursor: 'pointer',
                color: '#f6eddd',
              }}
              aria-label="Clear search"
            >
              <svg style={{ width: '0.7rem', height: '0.7rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Feed Tabs */}
      {isLoggedIn && (
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid rgba(246, 237, 221, 0.1)',
          }}
        >
          {(['discover', 'following', 'my-posts'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveFeed(tab)}
              style={{
                flex: 1,
                padding: '12px 16px',
                background: 'none',
                border: 'none',
                borderBottom: activeFeed === tab
                  ? '2px solid #f6eddd'
                  : '2px solid transparent',
                color: activeFeed === tab
                  ? '#f6eddd'
                  : 'rgba(246, 237, 221, 0.5)',
                fontSize: '0.875rem',
                fontWeight: activeFeed === tab ? 600 : 400,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {tab === 'discover' ? 'Discover' : tab === 'following' ? 'Following' : 'My Posts'}
            </button>
          ))}
        </div>
      )}

      {/* Featured Section */}
      {activeFeed === 'discover' && !searchQuery && <FeaturedSection onPostClick={handlePostClick} />}

      {/* Filter Bar */}
      {activeFeed !== 'my-posts' && (
        <FilterBar selectedTag={selectedTag} onTagChange={handleTagChange} />
      )}

      {/* Post Grid */}
      <PostGrid
        posts={filteredPosts}
        loading={activeFeed === 'my-posts' ? myPostsLoading : loading}
        loadingMore={activeFeed === 'my-posts' ? myPostsLoadingMore : loadingMore}
        hasMore={searchQuery ? false : (activeFeed === 'my-posts' ? myPostsHasMore : hasMore)}
        onLoadMore={activeFeed === 'my-posts' ? loadMoreMyPosts : loadMore}
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
