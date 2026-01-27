'use client';

import { memo } from 'react';
import type { UgcPost } from './hooks/useFeed';
import { InstagramEmbedCompact } from './InstagramEmbed';
import { WorkoutRecapCard } from './WorkoutRecapCard';

interface PostCardProps {
  post: UgcPost;
  onClick: () => void;
}

function PostCardComponent({ post, onClick }: PostCardProps) {
  // Use displayName from API (includes email fallback) or compute client-side
  const userName = post.user.displayName ||
    (post.user.firstName && post.user.lastName
      ? `${post.user.firstName} ${post.user.lastName}`
      : post.user.firstName || 'Member');

  return (
    <div
      onClick={onClick}
      style={{
        position: 'relative',
        cursor: 'pointer',
        borderRadius: '2px',
        overflow: 'hidden',
        background: 'rgba(246, 237, 221, 0.05)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.02)';
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.3)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Media */}
      <div
        style={{
          position: 'relative',
          paddingBottom: post.mediaType === 'instagram' ? '100%' : (post.aspectRatio ? `${(1 / post.aspectRatio) * 100}%` : '100%'),
          background: 'rgba(246, 237, 221, 0.03)',
        }}
      >
        {/* Workout Recap without image - show styled recap card */}
        {post.postType === 'workout_recap' && !post.mediaUrl && post.workoutRecap ? (
          <WorkoutRecapCard
            recap={post.workoutRecap}
            userName={userName}
            studioName={post.studio?.name}
            size="compact"
          />
        ) : post.mediaType === 'instagram' && post.instagramUrl ? (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
            }}
          >
            {post.thumbnailUrl ? (
              <>
                <img
                  src={post.thumbnailUrl}
                  alt={post.caption || 'Instagram post'}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
                {/* Instagram badge */}
                <div
                  style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    background: 'rgba(0,0,0,0.6)',
                    borderRadius: '4px',
                    padding: '4px 6px',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="1.5"
                  >
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                  </svg>
                </div>
              </>
            ) : (
              <InstagramEmbedCompact url={post.instagramUrl} postId={post.instagramPostId} />
            )}
          </div>
        ) : post.mediaType === 'video' ? (
          <>
            <img
              src={post.thumbnailUrl || post.mediaUrl || ''}
              alt={post.caption || 'Post'}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
            {/* Video indicator */}
            <div
              style={{
                position: 'absolute',
                top: '8px',
                right: '8px',
                background: 'rgba(0,0,0,0.6)',
                padding: '4px 8px',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f6eddd" strokeWidth="2">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
              {post.durationSeconds && (
                <span style={{ fontSize: '0.75rem', color: '#f6eddd' }}>
                  {Math.floor(post.durationSeconds / 60)}:{String(post.durationSeconds % 60).padStart(2, '0')}
                </span>
              )}
            </div>
          </>
        ) : (
          <img
            src={post.mediaUrl || ''}
            alt={post.caption || 'Post'}
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

        {/* Featured badge */}
        {post.isFeatured && (
          <div
            style={{
              position: 'absolute',
              top: '8px',
              left: '8px',
              background: '#f59e0b',
              color: '#1a1a1a',
              fontSize: '0.65rem',
              fontWeight: 600,
              padding: '3px 8px',
              borderRadius: '2px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Featured
          </div>
        )}

        {/* Overlay on hover */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: '24px 12px 12px',
            background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              color: '#f6eddd',
              fontSize: '0.8rem',
            }}
          >
            {/* Likes */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill={post.isLiked ? '#ef4444' : 'none'}
                stroke={post.isLiked ? '#ef4444' : 'currentColor'}
                strokeWidth="2"
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              <span>{post.likesCount}</span>
            </div>

            {/* Comments */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              <span>{post.commentsCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Caption preview */}
      {post.caption && (
        <div
          style={{
            padding: '10px 12px',
            borderTop: '1px solid rgba(246, 237, 221, 0.1)',
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: '0.8rem',
              color: 'rgba(246, 237, 221, 0.8)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            <span style={{ color: '#f6eddd', fontWeight: 500 }}>{userName}</span>{' '}
            {post.caption}
          </p>
        </div>
      )}
    </div>
  );
}

export const PostCard = memo(PostCardComponent);
