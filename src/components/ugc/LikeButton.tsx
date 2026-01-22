'use client';

import { useState } from 'react';

interface LikeButtonProps {
  isLiked: boolean;
  count: number;
  onClick: () => void;
}

export function LikeButton({ isLiked, count, onClick }: LikeButtonProps) {
  const [animating, setAnimating] = useState(false);

  const handleClick = () => {
    if (!isLiked) {
      setAnimating(true);
      setTimeout(() => setAnimating(false), 300);
    }
    onClick();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        background: 'none',
        border: 'none',
        color: isLiked ? '#ef4444' : 'rgba(246, 237, 221, 0.8)',
        cursor: 'pointer',
        padding: '4px',
        transition: 'transform 0.2s ease',
        transform: animating ? 'scale(1.2)' : 'scale(1)',
      }}
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill={isLiked ? '#ef4444' : 'none'}
        stroke={isLiked ? '#ef4444' : 'currentColor'}
        strokeWidth="2"
        style={{ transition: 'all 0.2s ease' }}
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
      <span style={{ fontSize: '0.875rem' }}>{count}</span>
    </button>
  );
}
