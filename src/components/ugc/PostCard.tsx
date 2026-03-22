'use client';

import React, { memo, useState, useCallback } from 'react';
import type { UgcPost } from './hooks/useFeed';
import { InstagramEmbedCompact } from './InstagramEmbed';
import { WorkoutRecapCard } from './WorkoutRecapCard';

function renderCaptionWithMentions(caption: string) {
  const mentionRegex = /@([a-zA-Z0-9_.]+)/g;
  const parts: (string | React.ReactElement)[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = mentionRegex.exec(caption)) !== null) {
    if (match.index > lastIndex) {
      parts.push(caption.slice(lastIndex, match.index));
    }
    const username = match[1];
    parts.push(
      <a
        key={`mention-${match.index}`}
        href={`https://instagram.com/${username}`}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        style={{ color: '#f59e0b', textDecoration: 'none', fontWeight: 500 }}
      >
        @{username}
      </a>
    );
    lastIndex = mentionRegex.lastIndex;
  }

  if (lastIndex < caption.length) {
    parts.push(caption.slice(lastIndex));
  }

  return <>{parts}</>;
}

interface PostCardProps {
  post: UgcPost;
  onClick: () => void;
}

function PostCardComponent({ post, onClick }: PostCardProps) {
  const [thumbnailFailed, setThumbnailFailed] = useState(false);
  const [useDynamicThumb, setUseDynamicThumb] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  const handleShare = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/community?post=${post.id}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Check out this post on Pilareta', url });
      } catch {
        // User cancelled — fallback to clipboard
        await navigator.clipboard.writeText(url);
        setShareCopied(true);
        setTimeout(() => setShareCopied(false), 2000);
      }
    } else {
      await navigator.clipboard.writeText(url);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    }
  }, [post.id]);
  // Hide name for admin users, otherwise use displayName from API
  const userName = post.user.isAdmin
    ? 'Pilareta Team'
    : post.user.displayName ||
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
        {/* Workout Recap - show styled recap card (with or without background image) */}
        {post.postType === 'workout_recap' && post.workoutRecap ? (
          <WorkoutRecapCard
            recap={post.workoutRecap}
            userName={userName}
            studioName={post.studio?.name}
            size="compact"
            backgroundImageUrl={post.mediaUrl}
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
            {!thumbnailFailed ? (
              <>
                <img
                  src={
                    !post.thumbnailUrl || useDynamicThumb
                      ? `/api/ugc/thumbnail/${post.id}`
                      : post.thumbnailUrl
                  }
                  alt={post.caption || 'Instagram post'}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                  onError={() => {
                    if (!useDynamicThumb && post.thumbnailUrl) {
                      // thumbnailUrl failed (expired CDN URL), try dynamic endpoint
                      setUseDynamicThumb(true);
                    } else {
                      // Dynamic endpoint also failed — show placeholder
                      setThumbnailFailed(true);
                    }
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
              /* Fallback: Instagram-styled placeholder when thumbnail fails */
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'linear-gradient(135deg, #833AB4 0%, #FD1D1D 50%, #FCAF45 100%)',
                }}
              >
                <svg
                  width="40"
                  height="40"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="1.5"
                >
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
                <p style={{ margin: '8px 0 0', fontSize: '0.7rem', color: 'white', fontWeight: 500 }}>
                  View on Instagram
                </p>
              </div>
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
            onError={(e) => {
              // Hide broken image and show a placeholder background
              e.currentTarget.style.display = 'none';
              e.currentTarget.parentElement!.style.background =
                'linear-gradient(135deg, rgba(246,237,221,0.08) 0%, rgba(246,237,221,0.03) 100%)';
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

            {/* Share */}
            <button
              type="button"
              onClick={handleShare}
              title={shareCopied ? 'Link copied!' : 'Share'}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                background: 'none',
                border: 'none',
                color: shareCopied ? '#22c55e' : '#f6eddd',
                cursor: 'pointer',
                padding: 0,
                marginLeft: 'auto',
                fontSize: '0.8rem',
              }}
            >
              {shareCopied ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="18" cy="5" r="3" />
                  <circle cx="6" cy="12" r="3" />
                  <circle cx="18" cy="19" r="3" />
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                </svg>
              )}
            </button>
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
            {renderCaptionWithMentions(post.caption)}
          </p>
        </div>
      )}
    </div>
  );
}

export const PostCard = memo(PostCardComponent);
