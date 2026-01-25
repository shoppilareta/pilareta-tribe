'use client';

import { useState, useEffect } from 'react';
import { QuickLogModal } from './QuickLogModal';

interface LogWorkoutHereButtonProps {
  studioId: string;
  studioName: string;
}

export function LogWorkoutHereButton({ studioId, studioName }: LogWorkoutHereButtonProps) {
  const [showModal, setShowModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [logged, setLogged] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          setIsLoggedIn(true);
        }
      } catch {
        // Not logged in
      }
    }
    checkAuth();
  }, []);

  const handleComplete = () => {
    setShowModal(false);
    setLogged(true);
  };

  if (!isLoggedIn) {
    return (
      <a
        href={`/api/auth/login?redirect=/studio-locator`}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          width: '100%',
          padding: '0.75rem 1rem',
          background: 'rgba(246, 237, 221, 0.1)',
          border: '1px solid rgba(246, 237, 221, 0.2)',
          borderRadius: '0.5rem',
          color: '#f6eddd',
          fontSize: '0.9375rem',
          fontWeight: 500,
          textDecoration: 'none',
          marginTop: '0.75rem'
        }}
      >
        <svg style={{ width: '1.25rem', height: '1.25rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        Sign in to Log Workout
      </a>
    );
  }

  if (logged) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          width: '100%',
          padding: '0.75rem 1rem',
          background: 'rgba(34, 197, 94, 0.2)',
          borderRadius: '0.5rem',
          color: 'rgba(34, 197, 94, 1)',
          fontSize: '0.9375rem',
          fontWeight: 500,
          marginTop: '0.75rem'
        }}
      >
        <svg style={{ width: '1.25rem', height: '1.25rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        Workout Logged!
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          width: '100%',
          padding: '0.75rem 1rem',
          background: 'rgba(246, 237, 221, 0.1)',
          border: '1px solid rgba(246, 237, 221, 0.2)',
          borderRadius: '0.5rem',
          color: '#f6eddd',
          fontSize: '0.9375rem',
          fontWeight: 500,
          cursor: 'pointer',
          marginTop: '0.75rem',
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(246, 237, 221, 0.15)';
          e.currentTarget.style.borderColor = 'rgba(246, 237, 221, 0.3)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(246, 237, 221, 0.1)';
          e.currentTarget.style.borderColor = 'rgba(246, 237, 221, 0.2)';
        }}
      >
        <svg style={{ width: '1.25rem', height: '1.25rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
        Log Workout Here
      </button>

      {showModal && (
        <QuickLogModal
          onClose={() => setShowModal(false)}
          onComplete={handleComplete}
          prefill={{
            studioId,
            studioName
          }}
        />
      )}
    </>
  );
}
