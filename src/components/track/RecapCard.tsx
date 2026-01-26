'use client';

import { useRef, useEffect, useState } from 'react';

interface RecapCardProps {
  workoutDate: string;
  durationMinutes: number;
  workoutType: string;
  rpe: number;
  calorieEstimate?: number | null;
  studioName?: string | null;
  sessionName?: string | null;
  currentStreak?: number;
  focusAreas?: string[];
  imageUrl?: string | null;
}

export function RecapCard({
  workoutDate,
  durationMinutes,
  workoutType,
  rpe,
  calorieEstimate,
  studioName,
  sessionName,
  currentStreak = 0,
  focusAreas = [],
  imageUrl
}: RecapCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  // Transform URL for serving via API
  const getImageSrc = (url: string | null | undefined): string | null => {
    if (!url) return null;
    if (url.startsWith('/uploads/')) {
      return '/api' + url;
    }
    return url;
  };

  const imageSrc = getImageSrc(imageUrl);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  };

  const getTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      reformer: 'Reformer',
      mat: 'Mat',
      tower: 'Tower',
      other: 'Pilates'
    };
    return types[type] || type;
  };

  const getRpeColor = (value: number) => {
    if (value <= 3) return '#22c55e';
    if (value <= 5) return '#eab308';
    if (value <= 7) return '#f97316';
    return '#ef4444';
  };

  const getRpeLabel = (value: number) => {
    if (value <= 2) return 'Easy';
    if (value <= 4) return 'Light';
    if (value <= 6) return 'Moderate';
    if (value <= 8) return 'Hard';
    return 'All-out';
  };

  return (
    <div
      ref={cardRef}
      style={{
        width: '100%',
        maxWidth: '400px',
        aspectRatio: '1',
        background: imageSrc
          ? `linear-gradient(180deg, rgba(26, 27, 21, 0.4) 0%, rgba(26, 27, 21, 0.85) 60%, rgba(26, 27, 21, 0.95) 100%)`
          : 'linear-gradient(135deg, #202219 0%, #2a2b25 50%, #1a1b15 100%)',
        borderRadius: '1rem',
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
        border: '1px solid rgba(246, 237, 221, 0.1)'
      }}
    >
      {/* Background image (if provided) */}
      {imageSrc && (
        <div style={{
          position: 'absolute',
          inset: 0,
          zIndex: 0
        }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageSrc}
            alt="Workout"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
          />
          {/* Overlay gradient */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, rgba(26, 27, 21, 0.3) 0%, rgba(26, 27, 21, 0.7) 50%, rgba(26, 27, 21, 0.95) 100%)'
          }} />
        </div>
      )}

      {/* Background pattern (when no image) */}
      {!imageSrc && (
        <div style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '60%',
          height: '60%',
          background: 'radial-gradient(circle at top right, rgba(246, 237, 221, 0.03) 0%, transparent 60%)',
          pointerEvents: 'none'
        }} />
      )}

      {/* Streak badge */}
      {currentStreak > 1 && (
        <div style={{
          position: 'absolute',
          top: '1rem',
          right: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.375rem',
          padding: '0.375rem 0.75rem',
          background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.5) 0%, rgba(239, 68, 68, 0.4) 100%)',
          borderRadius: '9999px',
          fontSize: '0.875rem',
          fontWeight: 600,
          zIndex: 1,
          backdropFilter: 'blur(4px)'
        }}>
          <span>🔥</span>
          <span>{currentStreak} day streak</span>
        </div>
      )}

      {/* Top section - Date */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{
          fontSize: '0.8125rem',
          color: 'rgba(246, 237, 221, 0.5)',
          marginBottom: '0.25rem',
          letterSpacing: '0.05em',
          textTransform: 'uppercase'
        }}>
          Workout Complete
        </div>
        <div style={{
          fontSize: '1rem',
          color: 'rgba(246, 237, 221, 0.8)'
        }}>
          {formatDate(workoutDate)}
        </div>
      </div>

      {/* Middle section - Main stats */}
      <div style={{ textAlign: 'center', padding: '1rem 0', position: 'relative', zIndex: 1 }}>
        <div style={{
          fontSize: '3rem',
          fontWeight: 700,
          lineHeight: 1.1,
          marginBottom: '0.25rem'
        }}>
          {durationMinutes}
        </div>
        <div style={{
          fontSize: '1.25rem',
          color: 'rgba(246, 237, 221, 0.7)',
          marginBottom: '0.5rem'
        }}>
          minutes of {getTypeLabel(workoutType)}
        </div>

        {(studioName || sessionName) && (
          <div style={{
            fontSize: '0.875rem',
            color: 'rgba(246, 237, 221, 0.5)',
            marginTop: '0.5rem'
          }}>
            {studioName ? `at ${studioName}` : sessionName}
          </div>
        )}
      </div>

      {/* Bottom section - Stats row */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        paddingTop: '1rem',
        borderTop: '1px solid rgba(246, 237, 221, 0.1)',
        position: 'relative',
        zIndex: 1
      }}>
        {/* Intensity */}
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '2.5rem',
            height: '2.5rem',
            borderRadius: '50%',
            background: getRpeColor(rpe),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 0.25rem',
            fontSize: '1rem',
            fontWeight: 600,
            color: '#fff'
          }}>
            {rpe}
          </div>
          <div style={{
            fontSize: '0.6875rem',
            color: 'rgba(246, 237, 221, 0.5)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            {getRpeLabel(rpe)}
          </div>
        </div>

        {/* Calories */}
        {calorieEstimate && (
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: '1.25rem',
              fontWeight: 600,
              marginBottom: '0.125rem'
            }}>
              ~{calorieEstimate}
            </div>
            <div style={{
              fontSize: '0.6875rem',
              color: 'rgba(246, 237, 221, 0.5)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              Est. Cal
            </div>
          </div>
        )}

        {/* Focus areas */}
        {focusAreas.length > 0 && (
          <div style={{ textAlign: 'center' }}>
            <div style={{
              display: 'flex',
              gap: '0.25rem',
              justifyContent: 'center',
              marginBottom: '0.25rem'
            }}>
              {focusAreas.slice(0, 3).map((area) => (
                <div
                  key={area}
                  style={{
                    width: '1.5rem',
                    height: '1.5rem',
                    borderRadius: '0.25rem',
                    background: 'rgba(99, 102, 241, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.625rem',
                    fontWeight: 600,
                    textTransform: 'uppercase'
                  }}
                >
                  {area.slice(0, 1)}
                </div>
              ))}
            </div>
            <div style={{
              fontSize: '0.6875rem',
              color: 'rgba(246, 237, 221, 0.5)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              Focus
            </div>
          </div>
        )}

        {/* Pilareta branding */}
        <div style={{ textAlign: 'right' }}>
          <div style={{
            fontSize: '0.875rem',
            fontWeight: 600,
            letterSpacing: '0.05em',
            opacity: 0.8
          }}>
            PILARETA
          </div>
          <div style={{
            fontSize: '0.625rem',
            color: 'rgba(246, 237, 221, 0.4)',
            letterSpacing: '0.05em'
          }}>
            TRIBE
          </div>
        </div>
      </div>
    </div>
  );
}

// Hook to get canvas image data from RecapCard (for sharing)
export function useRecapCardImage() {
  const [generating, setGenerating] = useState(false);

  const generateImage = async (cardElement: HTMLElement): Promise<string | null> => {
    setGenerating(true);
    try {
      // Dynamic import of html2canvas if available
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(cardElement, {
        backgroundColor: '#202219',
        scale: 2,
        useCORS: true,
        logging: false
      });
      return canvas.toDataURL('image/png');
    } catch {
      console.error('html2canvas not available');
      return null;
    } finally {
      setGenerating(false);
    }
  };

  return { generateImage, generating };
}
