'use client';

import { useMemo } from 'react';
import type { Studio } from './hooks/useStudios';

interface StudioCardProps {
  studio: Studio;
  onClick: () => void;
  selected?: boolean;
  isFavorited?: boolean;
  onToggleFavorite?: (studioId: string) => void;
}

/**
 * Determine if a studio is currently open based on Google Places openingHours data.
 * Returns true (open), false (closed), or null (unknown/no data).
 */
function isStudioOpenNow(openingHours: Studio['openingHours']): boolean | null {
  if (!openingHours || typeof openingHours !== 'object') return null;
  // If the API directly tells us, trust it
  if (openingHours.open_now !== undefined) return openingHours.open_now;
  const periods = openingHours.periods;
  if (!Array.isArray(periods) || periods.length === 0) return null;

  const now = new Date();
  const currentDay = now.getDay(); // Sunday=0, same as Google Places
  const currentTime = `${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;

  for (const period of periods) {
    if (!period.open) continue;
    // 24-hour place
    if (period.open.day === 0 && period.open.time === '0000' && !period.close) {
      return true;
    }
    const openDay = period.open.day;
    const openTime = period.open.time;
    const closeDay = period.close?.day ?? openDay;
    const closeTime = period.close?.time ?? '2359';

    if (openDay === closeDay) {
      if (currentDay === openDay && currentTime >= openTime && currentTime < closeTime) {
        return true;
      }
    } else {
      if (
        (currentDay === openDay && currentTime >= openTime) ||
        (currentDay === closeDay && currentTime < closeTime)
      ) {
        return true;
      }
    }
  }
  return false;
}

function formatDistance(distanceKm: number | undefined): string {
  if (!distanceKm) return '';
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`;
  }
  return `${distanceKm.toFixed(1)} km`;
}

function getPhotoUrl(photoReference: string): string {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';
  return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=100&photo_reference=${photoReference}&key=${apiKey}`;
}

export function StudioCard({ studio, onClick, selected, isFavorited, onToggleFavorite }: StudioCardProps) {
  const hasPhoto = studio.photos && studio.photos.length > 0;
  const openNow = useMemo(() => isStudioOpenNow(studio.openingHours), [studio.openingHours]);

  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: 'block',
        width: '100%',
        textAlign: 'left',
        padding: '1rem',
        background: selected ? 'rgba(246, 237, 221, 0.1)' : 'rgba(246, 237, 221, 0.05)',
        border: selected ? '1px solid rgba(246, 237, 221, 0.3)' : '1px solid transparent',
        borderRadius: '0.5rem',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
      }}
    >
      <div style={{ display: 'flex', gap: '0.75rem' }}>
        {/* Photo or placeholder */}
        <div
          style={{
            width: '4rem',
            height: '4rem',
            borderRadius: '0.375rem',
            flexShrink: 0,
            overflow: 'hidden',
            background: 'rgba(246, 237, 221, 0.1)',
          }}
        >
          {hasPhoto ? (
            <img
              src={getPhotoUrl(studio.photos![0].reference)}
              alt={studio.name}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          ) : (
            <div
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(246, 237, 221, 0.3)" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </div>
          )}
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', flex: 1, minWidth: 0 }}>
              <h3
                style={{
                  fontSize: '0.9375rem',
                  fontWeight: 500,
                  color: '#f6eddd',
                  margin: 0,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {studio.name}
              </h3>
              {/* Favorite heart */}
              {onToggleFavorite && (
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(studio.id);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') { e.stopPropagation(); onToggleFavorite(studio.id); }
                  }}
                  style={{
                    cursor: 'pointer',
                    flexShrink: 0,
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '0.125rem',
                  }}
                  title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill={isFavorited ? '#ef4444' : 'none'} stroke={isFavorited ? '#ef4444' : 'rgba(246, 237, 221, 0.5)'} strokeWidth="2">
                    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                  </svg>
                </span>
              )}
              {/* Open/Closed badge */}
              {openNow !== null && (
                <span
                  style={{
                    fontSize: '0.625rem',
                    fontWeight: 600,
                    padding: '0.0625rem 0.375rem',
                    borderRadius: '9999px',
                    flexShrink: 0,
                    background: openNow ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                    color: openNow ? '#22c55e' : '#ef4444',
                  }}
                >
                  {openNow ? 'Open' : 'Closed'}
                </span>
              )}
            </div>
            {studio.distance !== undefined && (
              <span
                style={{
                  fontSize: '0.75rem',
                  color: 'rgba(246, 237, 221, 0.6)',
                  flexShrink: 0,
                }}
              >
                {formatDistance(studio.distance)}
              </span>
            )}
          </div>

          <p
            style={{
              fontSize: '0.8125rem',
              color: 'rgba(246, 237, 221, 0.6)',
              margin: '0.25rem 0 0 0',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {studio.formattedAddress || studio.address || studio.city}
          </p>

          {/* Rating */}
          {studio.rating && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.375rem',
                marginTop: '0.375rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.125rem' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#fbbf24" stroke="none">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                <span style={{ fontSize: '0.8125rem', color: '#f6eddd', fontWeight: 500 }}>
                  {studio.rating.toFixed(1)}
                </span>
              </div>
              {studio.ratingCount && (
                <span style={{ fontSize: '0.75rem', color: 'rgba(246, 237, 221, 0.5)' }}>
                  ({studio.ratingCount})
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </button>
  );
}
