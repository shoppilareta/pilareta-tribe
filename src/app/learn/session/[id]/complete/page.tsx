'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface Session {
  id: string;
  name: string;
  durationMinutes: number;
  totalSets: number;
  totalReps: number | null;
  rpeTarget: number;
  items: { id: string }[];
}

export default function SessionCompletePage() {
  const params = useParams();
  const sessionId = params.id as string;
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    async function fetchSession() {
      try {
        const response = await fetch(`/api/learn/session/${sessionId}`);
        if (response.ok) {
          const data = await response.json();
          setSession(data.session);
        }
      } catch (error) {
        console.error('Error loading session:', error);
      }
    }
    fetchSession();
  }, [sessionId]);

  return (
    <div className="container" style={{ paddingTop: '3rem', paddingBottom: '3rem' }}>
      <div style={{ maxWidth: '28rem', margin: '0 auto', textAlign: 'center' }}>
        {/* Success Icon */}
        <div style={{
          width: '5rem',
          height: '5rem',
          borderRadius: '9999px',
          background: 'rgba(150, 255, 150, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.5rem'
        }}>
          <svg style={{ width: '3rem', height: '3rem', color: 'rgb(150, 255, 150)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 style={{ fontSize: '1.75rem', fontWeight: 500, marginBottom: '0.5rem' }}>
          Session Complete!
        </h1>
        <p style={{ color: 'rgba(246, 237, 221, 0.6)', marginBottom: '2rem' }}>
          Great work! You&apos;ve completed your Pilates session.
        </p>

        {/* Session Stats */}
        {session && (
          <div className="card" style={{ marginBottom: '2rem', textAlign: 'left' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 500, marginBottom: '1rem', textAlign: 'center' }}>
              Session Summary
            </h2>
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                <span style={{ color: 'rgba(246, 237, 221, 0.6)' }}>Session</span>
                <span style={{ fontWeight: 500 }}>{session.name}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                <span style={{ color: 'rgba(246, 237, 221, 0.6)' }}>Duration</span>
                <span style={{ fontWeight: 500 }}>{session.durationMinutes} minutes</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                <span style={{ color: 'rgba(246, 237, 221, 0.6)' }}>Exercises</span>
                <span style={{ fontWeight: 500 }}>{session.items.length}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                <span style={{ color: 'rgba(246, 237, 221, 0.6)' }}>Total Sets</span>
                <span style={{ fontWeight: 500 }}>{session.totalSets}</span>
              </div>
              {session.totalReps && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                  <span style={{ color: 'rgba(246, 237, 221, 0.6)' }}>Total Reps</span>
                  <span style={{ fontWeight: 500 }}>{session.totalReps}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <Link href="/learn/builder" className="btn btn-primary" style={{ width: '100%' }}>
            Build Another Session
          </Link>
          <Link href="/learn/programs" className="btn btn-outline" style={{ width: '100%' }}>
            Try a Program
          </Link>
          <Link href="/learn" style={{
            color: 'rgba(246, 237, 221, 0.6)',
            fontSize: '0.875rem',
            textDecoration: 'none',
            marginTop: '0.5rem'
          }}>
            Back to Learn
          </Link>
        </div>
      </div>
    </div>
  );
}
