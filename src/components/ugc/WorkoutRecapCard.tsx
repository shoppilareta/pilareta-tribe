'use client';

import type { WorkoutRecap } from './hooks/useFeed';

interface WorkoutRecapCardProps {
  recap: WorkoutRecap;
  userName?: string;
  studioName?: string;
  streak?: number;
  size?: 'compact' | 'full';
}

const focusAreaLabels: Record<string, string> = {
  core: 'Core',
  glutes: 'Glutes',
  legs: 'Legs',
  arms: 'Arms',
  back: 'Back',
  mobility: 'Mobility',
};

const focusAreaEmojis: Record<string, string> = {
  core: '🎯',
  glutes: '🍑',
  legs: '🦵',
  arms: '💪',
  back: '🔙',
  mobility: '🧘',
};

function IntensityRing({ rpe, size }: { rpe: number; size: 'compact' | 'full' }) {
  const circumference = 2 * Math.PI * 40;
  const progress = (rpe / 10) * circumference;
  const ringSize = size === 'compact' ? 60 : 90;
  const strokeWidth = size === 'compact' ? 6 : 8;

  const getIntensityColor = (rpe: number) => {
    if (rpe <= 3) return '#9CAF88'; // Sage - light
    if (rpe <= 5) return '#C4A484'; // Warm tan
    if (rpe <= 7) return '#D4A574'; // Terracotta light
    return '#E07B39'; // Terracotta
  };

  const getIntensityLabel = (rpe: number) => {
    if (rpe <= 3) return 'Light';
    if (rpe <= 5) return 'Moderate';
    if (rpe <= 7) return 'Challenging';
    return 'Intense';
  };

  return (
    <div style={{ position: 'relative', width: ringSize, height: ringSize }}>
      <svg
        width={ringSize}
        height={ringSize}
        viewBox="0 0 100 100"
        style={{ transform: 'rotate(-90deg)' }}
      >
        {/* Background ring */}
        <circle
          cx="50"
          cy="50"
          r="40"
          fill="none"
          stroke="rgba(246, 237, 221, 0.15)"
          strokeWidth={strokeWidth}
        />
        {/* Progress ring */}
        <circle
          cx="50"
          cy="50"
          r="40"
          fill="none"
          stroke={getIntensityColor(rpe)}
          strokeWidth={strokeWidth}
          strokeDasharray={`${progress} ${circumference}`}
          strokeLinecap="round"
        />
      </svg>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span style={{
          fontSize: size === 'compact' ? '1.25rem' : '1.75rem',
          fontWeight: 700,
          color: '#F6EDDD',
          lineHeight: 1,
        }}>
          {rpe}
        </span>
        {size === 'full' && (
          <span style={{
            fontSize: '0.6rem',
            color: 'rgba(246, 237, 221, 0.6)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}>
            {getIntensityLabel(rpe)}
          </span>
        )}
      </div>
    </div>
  );
}

export function WorkoutRecapCard({ recap, userName, studioName, streak, size = 'full' }: WorkoutRecapCardProps) {
  const workoutDate = new Date(recap.workoutDate);
  const formattedDate = workoutDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  const typeLabels: Record<string, string> = {
    reformer: 'Reformer',
    mat: 'Mat',
    tower: 'Tower',
    other: 'Pilates',
  };

  if (size === 'compact') {
    return (
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'linear-gradient(145deg, #3D3426 0%, #2A2520 50%, #1F1B17 100%)',
          display: 'flex',
          flexDirection: 'column',
          padding: '0.75rem',
        }}
      >
        {/* Top row - Type badge & streak */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div
            style={{
              background: 'rgba(156, 175, 136, 0.3)',
              borderRadius: '4px',
              padding: '3px 8px',
              fontSize: '0.6rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: '#9CAF88',
            }}
          >
            {typeLabels[recap.workoutType] || recap.workoutType}
          </div>
          {streak && streak > 1 && (
            <div
              style={{
                background: 'linear-gradient(135deg, #E07B39 0%, #D4A574 100%)',
                borderRadius: '4px',
                padding: '3px 6px',
                fontSize: '0.6rem',
                fontWeight: 700,
                color: '#1F1B17',
                display: 'flex',
                alignItems: 'center',
                gap: '2px',
              }}
            >
              🔥 {streak}
            </div>
          )}
        </div>

        {/* Center content */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.25rem',
        }}>
          <div style={{
            fontSize: '2rem',
            fontWeight: 700,
            color: '#F6EDDD',
            lineHeight: 1,
          }}>
            {recap.durationMinutes}
            <span style={{ fontSize: '0.875rem', fontWeight: 500, marginLeft: '2px' }}>min</span>
          </div>

          {/* Focus areas as small dots */}
          {recap.focusAreas && recap.focusAreas.length > 0 && (
            <div style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>
              {recap.focusAreas.slice(0, 3).map((area) => (
                <span key={area} style={{ fontSize: '0.7rem' }}>
                  {focusAreaEmojis[area] || '•'}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Bottom row - calories & intensity */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
        }}>
          {recap.calorieEstimate ? (
            <div style={{ fontSize: '0.7rem', color: 'rgba(246, 237, 221, 0.6)' }}>
              ~{recap.calorieEstimate} cal
            </div>
          ) : (
            <div />
          )}
          <IntensityRing rpe={recap.rpe} size="compact" />
        </div>

        {/* Branding watermark */}
        <div
          style={{
            position: 'absolute',
            bottom: '6px',
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: '0.5rem',
            color: 'rgba(246, 237, 221, 0.25)',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
          }}
        >
          Pilareta
        </div>
      </div>
    );
  }

  // Full size card
  return (
    <div
      style={{
        width: '100%',
        maxWidth: '420px',
        aspectRatio: '1',
        background: 'linear-gradient(145deg, #3D3426 0%, #2A2520 40%, #1F1B17 100%)',
        borderRadius: '12px',
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative background elements */}
      <div
        style={{
          position: 'absolute',
          top: '-50%',
          right: '-30%',
          width: '80%',
          height: '80%',
          background: 'radial-gradient(circle, rgba(156, 175, 136, 0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-30%',
          left: '-20%',
          width: '60%',
          height: '60%',
          background: 'radial-gradient(circle, rgba(212, 165, 116, 0.06) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* Header - Date & Streak */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 1 }}>
        <div>
          <div style={{ fontSize: '0.75rem', color: 'rgba(246, 237, 221, 0.5)', marginBottom: '2px' }}>
            {formattedDate}
          </div>
          {userName && (
            <div style={{ fontSize: '0.9rem', color: '#F6EDDD', fontWeight: 500 }}>
              {userName}
            </div>
          )}
        </div>
        {streak && streak > 1 && (
          <div
            style={{
              background: 'linear-gradient(135deg, #E07B39 0%, #D4A574 100%)',
              borderRadius: '8px',
              padding: '8px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span style={{ fontSize: '1.25rem' }}>🔥</span>
            <div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1F1B17', lineHeight: 1 }}>
                {streak}
              </div>
              <div style={{ fontSize: '0.55rem', color: '#3D3426', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                day streak
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main content */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1,
        gap: '0.75rem',
      }}>
        {/* Workout type badge */}
        <div
          style={{
            background: 'rgba(156, 175, 136, 0.2)',
            border: '1px solid rgba(156, 175, 136, 0.3)',
            borderRadius: '20px',
            padding: '6px 16px',
            fontSize: '0.8rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: '#9CAF88',
          }}
        >
          {typeLabels[recap.workoutType] || recap.workoutType}
        </div>

        {/* Duration - hero stat */}
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: '4rem',
            fontWeight: 700,
            color: '#F6EDDD',
            lineHeight: 1,
            letterSpacing: '-0.02em',
          }}>
            {recap.durationMinutes}
          </div>
          <div style={{
            fontSize: '1rem',
            color: 'rgba(246, 237, 221, 0.6)',
            textTransform: 'uppercase',
            letterSpacing: '0.15em',
            marginTop: '4px',
          }}>
            minutes
          </div>
        </div>

        {/* Focus areas */}
        {recap.focusAreas && recap.focusAreas.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
            {recap.focusAreas.map((area) => (
              <div
                key={area}
                style={{
                  background: 'rgba(246, 237, 221, 0.08)',
                  borderRadius: '6px',
                  padding: '4px 10px',
                  fontSize: '0.75rem',
                  color: 'rgba(246, 237, 221, 0.7)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <span>{focusAreaEmojis[area]}</span>
                {focusAreaLabels[area] || area}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer - Stats row */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        zIndex: 1,
        borderTop: '1px solid rgba(246, 237, 221, 0.1)',
        paddingTop: '1rem',
        marginTop: '0.5rem',
      }}>
        {/* Left - Calories & Studio */}
        <div>
          {recap.calorieEstimate && (
            <div style={{
              fontSize: '1.1rem',
              fontWeight: 600,
              color: '#D4A574',
              marginBottom: '4px',
            }}>
              ~{recap.calorieEstimate} <span style={{ fontSize: '0.75rem', fontWeight: 400 }}>cal</span>
            </div>
          )}
          {studioName && (
            <div style={{
              fontSize: '0.75rem',
              color: 'rgba(246, 237, 221, 0.5)',
            }}>
              at {studioName}
            </div>
          )}
        </div>

        {/* Right - Intensity ring */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <IntensityRing rpe={recap.rpe} size="full" />
          <span style={{
            fontSize: '0.6rem',
            color: 'rgba(246, 237, 221, 0.4)',
            marginTop: '4px',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}>
            Intensity
          </span>
        </div>
      </div>

      {/* Branding */}
      <div
        style={{
          position: 'absolute',
          bottom: '12px',
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: '0.65rem',
          color: 'rgba(246, 237, 221, 0.2)',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          fontWeight: 500,
        }}
      >
        Pilareta
      </div>
    </div>
  );
}
