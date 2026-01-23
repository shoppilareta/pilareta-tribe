'use client';

import { useState, useEffect } from 'react';
import type { UgcPost } from './hooks/useFeed';
import { InstagramEmbedCompact } from './InstagramEmbed';

interface FeaturedSectionProps {
  onPostClick: (post: UgcPost) => void;
}

export function FeaturedSection({ onPostClick }: FeaturedSectionProps) {
  const [posts, setPosts] = useState<UgcPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const response = await fetch('/api/ugc/featured?limit=6');
        const data = await response.json();
        if (response.ok) {
          setPosts(data.posts);
        }
      } catch {
        // Silently fail
      } finally {
        setLoading(false);
      }
    };

    fetchFeatured();
  }, []);

  if (loading || posts.length === 0) {
    return null;
  }

  return (
    <section
      style={{
        padding: '2rem 1rem',
        borderBottom: '1px solid rgba(246, 237, 221, 0.1)',
      }}
    >
      <h2
        style={{
          margin: '0 0 1.5rem',
          fontSize: '0.75rem',
          fontWeight: 500,
          textTransform: 'uppercase',
          letterSpacing: '0.15em',
          color: 'rgba(246, 237, 221, 0.6)',
        }}
      >
        Featured Posts
      </h2>

      <div
        style={{
          display: 'flex',
          gap: '12px',
          overflowX: 'auto',
          paddingBottom: '8px',
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(246, 237, 221, 0.2) transparent',
        }}
      >
        {posts.map((post) => (
          <div
            key={post.id}
            onClick={() => onPostClick(post)}
            style={{
              flexShrink: 0,
              width: '200px',
              cursor: 'pointer',
              borderRadius: '2px',
              overflow: 'hidden',
              background: 'rgba(246, 237, 221, 0.05)',
              transition: 'transform 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.03)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <div
              style={{
                position: 'relative',
                paddingBottom: '125%',
                background: 'rgba(246, 237, 221, 0.03)',
              }}
            >
              {post.mediaType === 'instagram' && post.instagramUrl ? (
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                  }}
                >
                  <InstagramEmbedCompact url={post.instagramUrl} postId={post.instagramPostId} />
                </div>
              ) : (
                <img
                  src={post.mediaType === 'video' && post.thumbnailUrl ? post.thumbnailUrl : (post.mediaUrl || '')}
                  alt={post.caption || 'Featured post'}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              )}

              {/* Gradient overlay */}
              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  padding: '24px 10px 10px',
                  background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: '#f6eddd',
                    fontSize: '0.75rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill={post.isLiked ? '#ef4444' : 'none'}
                      stroke={post.isLiked ? '#ef4444' : 'currentColor'}
                      strokeWidth="2"
                    >
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                    <span>{post.likesCount}</span>
                  </div>
                </div>
              </div>

              {/* Video indicator */}
              {post.mediaType === 'video' && (
                <div
                  style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    background: 'rgba(0,0,0,0.6)',
                    padding: '3px 6px',
                    borderRadius: '3px',
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#f6eddd" strokeWidth="2">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
