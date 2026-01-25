'use client';

import { useState, useRef } from 'react';
import { RecapCard } from './RecapCard';

interface WorkoutLog {
  id: string;
  workoutDate: string;
  durationMinutes: number;
  workoutType: string;
  rpe: number;
  calorieEstimate: number | null;
  focusAreas: string[];
  studio?: {
    id: string;
    name: string;
  } | null;
  session?: {
    id: string;
    name: string;
  } | null;
}

interface ShareModalProps {
  log: WorkoutLog;
  currentStreak: number;
  onClose: () => void;
  onShared: () => void;
}

export function ShareModal({ log, currentStreak, onClose, onShared }: ShareModalProps) {
  const [caption, setCaption] = useState('');
  const [sharing, setSharing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shared, setShared] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Generate default caption
  const getDefaultCaption = () => {
    const parts: string[] = [];
    parts.push(`${log.durationMinutes}-min ${log.workoutType} workout`);

    if (log.studio) {
      parts.push(`at ${log.studio.name}`);
    } else if (log.session) {
      parts.push(`- ${log.session.name}`);
    }

    if (currentStreak > 1) {
      parts.push(`\n\n${currentStreak}-day streak 🔥`);
    }

    return parts.join(' ');
  };

  const handleShare = async () => {
    setSharing(true);
    setError(null);

    try {
      const response = await fetch(`/api/track/logs/${log.id}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caption: caption || getDefaultCaption()
        })
      });

      if (response.ok) {
        setShared(true);
        setTimeout(() => {
          onShared();
        }, 1500);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to share');
      }
    } catch {
      setError('Failed to share workout');
    } finally {
      setSharing(false);
    }
  };

  const handleDownload = async () => {
    if (!cardRef.current) return;

    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#202219',
        scale: 2,
        useCORS: true,
        logging: false
      });

      const link = document.createElement('a');
      link.download = `pilareta-workout-${log.id}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch {
      alert('Could not generate image. Please try again.');
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem'
      }}
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(4px)'
        }}
      />

      {/* Modal */}
      <div
        className="card"
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '32rem',
          maxHeight: '90vh',
          overflow: 'auto'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Share to Community</h2>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'rgba(246, 237, 221, 0.6)',
              cursor: 'pointer',
              padding: '0.25rem'
            }}
          >
            <svg style={{ width: '1.5rem', height: '1.5rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {shared ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div style={{
              width: '4rem',
              height: '4rem',
              borderRadius: '50%',
              background: 'rgba(34, 197, 94, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem'
            }}>
              <svg style={{ width: '2rem', height: '2rem', color: 'rgba(34, 197, 94, 1)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 500, marginBottom: '0.5rem' }}>
              Shared to Community!
            </h3>
            <p style={{ color: 'rgba(246, 237, 221, 0.6)', fontSize: '0.875rem' }}>
              Your workout recap is now visible in the Community feed.
            </p>
          </div>
        ) : (
          <>
            {/* Recap Card Preview */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }} ref={cardRef}>
              <RecapCard
                workoutDate={log.workoutDate}
                durationMinutes={log.durationMinutes}
                workoutType={log.workoutType}
                rpe={log.rpe}
                calorieEstimate={log.calorieEstimate}
                studioName={log.studio?.name}
                sessionName={log.session?.name}
                currentStreak={currentStreak}
                focusAreas={log.focusAreas}
              />
            </div>

            {/* Caption */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>
                Caption (optional)
              </label>
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder={getDefaultCaption()}
                rows={3}
                style={{
                  width: '100%',
                  padding: '0.625rem',
                  background: 'rgba(246, 237, 221, 0.1)',
                  border: '1px solid rgba(246, 237, 221, 0.2)',
                  borderRadius: '0.5rem',
                  color: '#f6eddd',
                  fontSize: '0.9375rem',
                  resize: 'vertical'
                }}
              />
            </div>

            {/* Error */}
            {error && (
              <div style={{
                marginBottom: '1rem',
                padding: '0.75rem',
                background: 'rgba(239, 68, 68, 0.2)',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                color: 'rgba(239, 68, 68, 1)'
              }}>
                {error}
              </div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={handleDownload}
                className="btn btn-outline"
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
              >
                <svg style={{ width: '1.125rem', height: '1.125rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download
              </button>
              <button
                onClick={handleShare}
                className="btn btn-primary"
                style={{ flex: 1 }}
                disabled={sharing}
              >
                {sharing ? 'Sharing...' : 'Share to Community'}
              </button>
            </div>

            <p style={{
              textAlign: 'center',
              fontSize: '0.75rem',
              color: 'rgba(246, 237, 221, 0.5)',
              marginTop: '1rem'
            }}>
              Your recap will be posted to the Community feed
            </p>
          </>
        )}
      </div>
    </div>
  );
}
