'use client';

import { StudioActions } from './StudioActions';
import { LogWorkoutHereButton } from '@/components/track/LogWorkoutHereButton';
import type { Studio } from './hooks/useStudios';

interface StudioDetailProps {
  studio: Studio;
  onClaimClick: () => void;
  onSuggestEditClick: () => void;
}

function getPhotoUrl(photoReference: string, maxWidth: number = 400): string {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 'AIzaSyAU6a_TTpb_lAepYeVxKI9oB1TIkpze3fM';
  return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photo_reference=${photoReference}&key=${apiKey}`;
}

export function StudioDetail({ studio, onClaimClick, onSuggestEditClick }: StudioDetailProps) {
  const hasPhotos = studio.photos && studio.photos.length > 0;
  const hasOpeningHours = studio.openingHours?.weekday_text && studio.openingHours.weekday_text.length > 0;

  return (
    <div>
      {/* Header photo */}
      {hasPhotos && (
        <div
          style={{
            height: '160px',
            marginBottom: '1rem',
            borderRadius: '0.5rem',
            overflow: 'hidden',
            background: 'rgba(246, 237, 221, 0.05)',
          }}
        >
          <img
            src={getPhotoUrl(studio.photos![0].reference, 600)}
            alt={studio.name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        </div>
      )}

      {/* Name and rating */}
      <div style={{ marginBottom: '1rem' }}>
        <h2
          style={{
            fontSize: '1.25rem',
            fontWeight: 600,
            color: '#f6eddd',
            margin: '0 0 0.5rem 0',
          }}
        >
          {studio.name}
        </h2>

        {studio.rating && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <svg
                  key={star}
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill={star <= Math.round(studio.rating!) ? '#fbbf24' : 'none'}
                  stroke="#fbbf24"
                  strokeWidth="2"
                >
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              ))}
            </div>
            <span style={{ fontSize: '0.875rem', color: '#f6eddd' }}>
              {studio.rating.toFixed(1)}
            </span>
            {studio.ratingCount && (
              <span style={{ fontSize: '0.875rem', color: 'rgba(246, 237, 221, 0.6)' }}>
                ({studio.ratingCount} reviews)
              </span>
            )}
          </div>
        )}
      </div>

      {/* Address */}
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="rgba(246, 237, 221, 0.6)"
            strokeWidth="2"
            style={{ flexShrink: 0, marginTop: '0.125rem' }}
          >
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          <span style={{ color: 'rgba(246, 237, 221, 0.8)', fontSize: '0.9375rem' }}>
            {studio.formattedAddress || studio.address || studio.city}
          </span>
        </div>
      </div>

      {/* Phone */}
      {studio.phoneNumber && (
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="rgba(246, 237, 221, 0.6)"
              strokeWidth="2"
            >
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
            <span style={{ color: 'rgba(246, 237, 221, 0.8)', fontSize: '0.9375rem' }}>
              {studio.phoneNumber}
            </span>
          </div>
        </div>
      )}

      {/* Opening hours */}
      {hasOpeningHours && (
        <div style={{ marginBottom: '1.5rem' }}>
          <h3
            style={{
              fontSize: '0.875rem',
              fontWeight: 600,
              color: '#f6eddd',
              margin: '0 0 0.5rem 0',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            Opening Hours
            {studio.openingHours?.open_now !== undefined && (
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  padding: '0.125rem 0.5rem',
                  borderRadius: '9999px',
                  background: studio.openingHours.open_now
                    ? 'rgba(34, 197, 94, 0.2)'
                    : 'rgba(239, 68, 68, 0.2)',
                  color: studio.openingHours.open_now ? '#22c55e' : '#ef4444',
                }}
              >
                {studio.openingHours.open_now ? 'Open' : 'Closed'}
              </span>
            )}
          </h3>
          <div style={{ fontSize: '0.8125rem', color: 'rgba(246, 237, 221, 0.7)' }}>
            {studio.openingHours!.weekday_text!.map((line, idx) => (
              <div key={idx} style={{ padding: '0.25rem 0' }}>
                {line}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action buttons */}
      <StudioActions studio={studio} />

      {/* Log Workout Here button */}
      <LogWorkoutHereButton studioId={studio.id} studioName={studio.name} />

      {/* Claim/Edit links */}
      <div
        style={{
          marginTop: '1.5rem',
          paddingTop: '1rem',
          borderTop: '1px solid rgba(246, 237, 221, 0.1)',
          display: 'flex',
          gap: '1rem',
          justifyContent: 'center',
        }}
      >
        <button
          type="button"
          onClick={onClaimClick}
          style={{
            background: 'none',
            border: 'none',
            color: 'rgba(246, 237, 221, 0.5)',
            fontSize: '0.8125rem',
            cursor: 'pointer',
            textDecoration: 'underline',
            padding: 0,
          }}
        >
          Claim this studio
        </button>
        <button
          type="button"
          onClick={onSuggestEditClick}
          style={{
            background: 'none',
            border: 'none',
            color: 'rgba(246, 237, 221, 0.5)',
            fontSize: '0.8125rem',
            cursor: 'pointer',
            textDecoration: 'underline',
            padding: 0,
          }}
        >
          Suggest an edit
        </button>
      </div>
    </div>
  );
}
