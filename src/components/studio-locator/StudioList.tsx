'use client';

import { StudioCard } from './StudioCard';
import type { Studio } from './hooks/useStudios';

interface StudioListProps {
  studios: Studio[];
  loading: boolean;
  selectedStudioId: string | null;
  onSelectStudio: (studio: Studio) => void;
}

export function StudioList({ studios, loading, selectedStudioId, onSelectStudio }: StudioListProps) {
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        padding: '1rem',
      }}>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              padding: '1rem',
              background: 'rgba(246, 237, 221, 0.05)',
              borderRadius: '0.5rem',
            }}
          >
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <div
                style={{
                  width: '4rem',
                  height: '4rem',
                  borderRadius: '0.375rem',
                  background: 'rgba(246, 237, 221, 0.1)',
                  animation: 'pulse 2s infinite',
                }}
              />
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    height: '1rem',
                    width: '70%',
                    background: 'rgba(246, 237, 221, 0.1)',
                    borderRadius: '0.25rem',
                    marginBottom: '0.5rem',
                    animation: 'pulse 2s infinite',
                  }}
                />
                <div
                  style={{
                    height: '0.875rem',
                    width: '50%',
                    background: 'rgba(246, 237, 221, 0.08)',
                    borderRadius: '0.25rem',
                    animation: 'pulse 2s infinite',
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (studios.length === 0) {
    return (
      <div
        style={{
          padding: '2rem 1rem',
          textAlign: 'center',
          color: 'rgba(246, 237, 221, 0.6)',
        }}
      >
        <svg
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          style={{ margin: '0 auto 1rem', opacity: 0.5 }}
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <p style={{ margin: 0 }}>No studios found</p>
        <p style={{ margin: '0.5rem 0 0', fontSize: '0.875rem' }}>
          Try searching a different location or expanding your search radius.
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        padding: '0.5rem',
      }}
    >
      {studios.map((studio) => (
        <StudioCard
          key={studio.id}
          studio={studio}
          onClick={() => onSelectStudio(studio)}
          selected={studio.id === selectedStudioId}
        />
      ))}
    </div>
  );
}
