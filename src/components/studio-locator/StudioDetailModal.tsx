'use client';

import { useEffect, useCallback } from 'react';
import { StudioDetail } from './StudioDetail';
import type { Studio } from './hooks/useStudios';

interface StudioDetailModalProps {
  studio: Studio | null;
  onClose: () => void;
  onClaimClick: () => void;
  onSuggestEditClick: () => void;
}

export function StudioDetailModal({
  studio,
  onClose,
  onClaimClick,
  onSuggestEditClick,
}: StudioDetailModalProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (studio) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [studio, handleKeyDown]);

  if (!studio) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '1rem',
        paddingTop: '2rem',
        overflowY: 'auto',
      }}
    >
      {/* Backdrop */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(4px)',
        }}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '28rem',
          maxHeight: 'calc(100dvh - 3rem)',
          background: '#1a1a1a',
          borderRadius: '0.75rem',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
        }}
      >
        {/* Close button - in a non-scrolling header bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            padding: '0.5rem 0.5rem 0',
            position: 'relative',
            zIndex: 10,
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              width: '2rem',
              height: '2rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(246, 237, 221, 0.1)',
              border: 'none',
              borderRadius: '50%',
              color: '#f6eddd',
              cursor: 'pointer',
            }}
            aria-label="Close"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div
          style={{
            flex: 1,
            overflow: 'auto',
            padding: '0 1.5rem 1.5rem',
          }}
        >
          <StudioDetail
            studio={studio}
            onClaimClick={onClaimClick}
            onSuggestEditClick={onSuggestEditClick}
          />
        </div>
      </div>
    </div>
  );
}
