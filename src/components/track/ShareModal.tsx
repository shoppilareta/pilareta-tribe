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
  imageUrl?: string | null;
  customStudioName?: string | null;
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
  log: WorkoutLog & { isShared?: boolean };
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

    const studioName = log.studio?.name || log.customStudioName;
    if (studioName) {
      parts.push(`at ${studioName}`);
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

  const generateCardImage = async (): Promise<string | null> => {
    if (!cardRef.current) return null;

    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#202219',
        scale: 2,
        useCORS: true,
        logging: false
      });
      return canvas.toDataURL('image/png');
    } catch {
      return null;
    }
  };

  const handleDownload = async () => {
    const dataUrl = await generateCardImage();
    if (!dataUrl) {
      alert('Could not generate image. Please try again.');
      return;
    }

    const link = document.createElement('a');
    link.download = `pilareta-workout-${log.id}.png`;
    link.href = dataUrl;
    link.click();
  };

  const handleShareWhatsApp = () => {
    const text = caption || getDefaultCaption();
    const encodedText = encodeURIComponent(text + '\n\nTrack your Pilates journey at tribe.pilareta.com/track');
    window.open(`https://wa.me/?text=${encodedText}`, '_blank');
  };

  const handleCopyToClipboard = async () => {
    const dataUrl = await generateCardImage();
    if (!dataUrl) {
      alert('Could not generate image. Please try again.');
      return;
    }

    try {
      // Convert data URL to blob
      const response = await fetch(dataUrl);
      const blob = await response.blob();

      // Try to use the modern clipboard API
      if (navigator.clipboard && 'write' in navigator.clipboard) {
        await navigator.clipboard.write([
          new ClipboardItem({
            [blob.type]: blob
          })
        ]);
        alert('Image copied to clipboard! You can now paste it into Instagram or other apps.');
      } else {
        // Fallback: download the image
        handleDownload();
        alert('Image downloaded! Open Instagram and create a new story to share.');
      }
    } catch {
      // Fallback: download the image
      handleDownload();
      alert('Image downloaded! Open Instagram and create a new story to share.');
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
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Share Workout</h2>
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
                studioName={log.studio?.name || log.customStudioName || undefined}
                sessionName={log.session?.name}
                currentStreak={currentStreak}
                focusAreas={log.focusAreas}
                imageUrl={log.imageUrl}
              />
            </div>

            {/* Already shared notice */}
            {log.isShared && (
              <div style={{
                marginBottom: '1rem',
                padding: '0.75rem',
                background: 'rgba(34, 197, 94, 0.1)',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                color: 'rgba(34, 197, 94, 0.9)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <svg style={{ width: '1rem', height: '1rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Already shared to Community
              </div>
            )}

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

            {/* Share options */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.75rem' }}>
                Share to...
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: log.isShared ? 'repeat(3, 1fr)' : 'repeat(2, 1fr)', gap: '0.75rem' }}>
                {/* Download */}
                <button
                  onClick={handleDownload}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '1rem',
                    background: 'rgba(246, 237, 221, 0.05)',
                    border: '1px solid rgba(246, 237, 221, 0.2)',
                    borderRadius: '0.75rem',
                    color: '#f6eddd',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(246, 237, 221, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(246, 237, 221, 0.05)';
                  }}
                >
                  <svg style={{ width: '1.5rem', height: '1.5rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 500 }}>Save Image</span>
                </button>

                {/* Instagram */}
                <button
                  onClick={handleCopyToClipboard}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '1rem',
                    background: 'linear-gradient(135deg, rgba(131, 58, 180, 0.2) 0%, rgba(253, 29, 29, 0.15) 50%, rgba(252, 176, 69, 0.1) 100%)',
                    border: '1px solid rgba(131, 58, 180, 0.3)',
                    borderRadius: '0.75rem',
                    color: '#f6eddd',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = '0.9';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = '1';
                  }}
                >
                  <svg style={{ width: '1.5rem', height: '1.5rem' }} viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 500 }}>Instagram</span>
                </button>

                {/* WhatsApp */}
                <button
                  onClick={handleShareWhatsApp}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '1rem',
                    background: 'rgba(37, 211, 102, 0.15)',
                    border: '1px solid rgba(37, 211, 102, 0.3)',
                    borderRadius: '0.75rem',
                    color: '#f6eddd',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(37, 211, 102, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(37, 211, 102, 0.15)';
                  }}
                >
                  <svg style={{ width: '1.5rem', height: '1.5rem' }} viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 500 }}>WhatsApp</span>
                </button>

                {/* Community - only show if not already shared */}
                {!log.isShared && (
                  <button
                    onClick={handleShare}
                    disabled={sharing}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '1rem',
                      background: 'rgba(99, 102, 241, 0.2)',
                      border: '1px solid rgba(99, 102, 241, 0.3)',
                      borderRadius: '0.75rem',
                      color: '#f6eddd',
                      cursor: sharing ? 'not-allowed' : 'pointer',
                      opacity: sharing ? 0.6 : 1,
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (!sharing) e.currentTarget.style.background = 'rgba(99, 102, 241, 0.25)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(99, 102, 241, 0.2)';
                    }}
                  >
                    <svg style={{ width: '1.5rem', height: '1.5rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span style={{ fontSize: '0.8125rem', fontWeight: 500 }}>
                      {sharing ? 'Posting...' : 'Community'}
                    </span>
                  </button>
                )}
              </div>
            </div>

            <p style={{
              textAlign: 'center',
              fontSize: '0.75rem',
              color: 'rgba(246, 237, 221, 0.5)'
            }}>
              Tip: Save the image first, then share to your favorite platform
            </p>
          </>
        )}
      </div>
    </div>
  );
}
