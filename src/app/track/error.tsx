'use client';

export default function TrackError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div
      style={{
        minHeight: '60vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#202219',
        color: '#f6eddd',
        padding: '2rem',
      }}
    >
      <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.5rem' }}>
        Something went wrong
      </h2>
      <p style={{ color: 'rgba(246, 237, 221, 0.6)', marginBottom: '1.5rem' }}>
        {error.message || 'Could not load your tracking data.'}
      </p>
      <button
        onClick={() => reset()}
        style={{
          padding: '0.6rem 1.5rem',
          backgroundColor: '#f6eddd',
          color: '#202219',
          border: 'none',
          borderRadius: '8px',
          fontSize: '0.9rem',
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        Try again
      </button>
    </div>
  );
}
