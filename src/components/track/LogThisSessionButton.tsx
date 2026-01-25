'use client';

import { useState } from 'react';
import { QuickLogModal } from './QuickLogModal';

interface LogThisSessionButtonProps {
  sessionId: string;
  sessionName: string;
  durationMinutes: number;
  workoutType?: string;
  focusAreas?: string[];
}

export function LogThisSessionButton({
  sessionId,
  sessionName,
  durationMinutes,
  workoutType = 'reformer',
  focusAreas = []
}: LogThisSessionButtonProps) {
  const [showModal, setShowModal] = useState(false);
  const [logged, setLogged] = useState(false);

  const handleComplete = () => {
    setShowModal(false);
    setLogged(true);
  };

  if (logged) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          padding: '0.75rem 1.5rem',
          background: 'rgba(34, 197, 94, 0.2)',
          borderRadius: '0.5rem',
          color: 'rgba(34, 197, 94, 1)',
          fontSize: '0.9375rem',
          fontWeight: 500
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
        className="btn btn-primary"
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem'
        }}
      >
        <svg style={{ width: '1.25rem', height: '1.25rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
        Log This Session
      </button>

      {showModal && (
        <QuickLogModal
          onClose={() => setShowModal(false)}
          onComplete={handleComplete}
          prefill={{
            sessionId,
            sessionName,
            durationMinutes,
            workoutType,
            focusAreas
          }}
        />
      )}
    </>
  );
}
