'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

interface WorkoutStats {
  currentStreak: number;
  totalWorkouts: number;
  weeklyMinutes: number;
}

export function HomeUserStats() {
  const [stats, setStats] = useState<WorkoutStats | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(() => {
    setLoading(true);
    setError(null);
    fetch('/api/track/stats')
      .then((res) => {
        if (res.status === 401) {
          setIsLoggedIn(false);
          return null;
        }
        if (!res.ok) throw new Error('Failed to load stats');
        setIsLoggedIn(true);
        return res.json();
      })
      .then((data) => {
        if (data?.stats) {
          setStats(data.stats);
        }
      })
      .catch((err) => {
        if (err.message === 'Failed to load stats') {
          setError('Could not load your workout stats.');
        }
        setIsLoggedIn(false);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const streak = stats?.currentStreak || 0;

  // Loading skeleton
  if (loading) {
    return (
      <section className="card">
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <div className="skeleton" style={{ width: '40px', height: '40px', borderRadius: '8px' }} />
            <div className="skeleton" style={{ width: '10rem', height: '1.25rem' }} />
          </div>
          <div className="skeleton" style={{ width: '75%', height: '0.875rem', marginTop: '0.5rem' }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginBottom: '1.5rem' }}>
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton" style={{ height: '3.5rem', borderRadius: '4px' }} />
          ))}
        </div>
        <div className="skeleton" style={{ height: '2.75rem', borderRadius: '9999px' }} />
      </section>
    );
  }

  return (
    <>
      <section className="card">
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                background: streak
                  ? 'linear-gradient(135deg, rgba(249, 115, 22, 0.3) 0%, rgba(239, 68, 68, 0.2) 100%)'
                  : 'rgba(246, 237, 221, 0.1)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {streak ? (
                <span style={{ fontSize: '1.25rem' }}>&#x1F525;</span>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f6eddd" strokeWidth="1.5">
                  <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  <path d="M9 12l2 2 4-4" />
                </svg>
              )}
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 500, margin: 0 }}>Track My Workouts</h2>
          </div>
          <p style={{ color: 'rgba(246, 237, 221, 0.6)', fontSize: '0.875rem', margin: 0 }}>
            Log workouts, build streaks, and track your progress
          </p>
        </div>

        {/* Error state with retry */}
        {error && (
          <div className="error-banner" style={{ marginBottom: '1rem' }}>
            <span>{error}</span>
            <button onClick={fetchStats}>Retry</button>
          </div>
        )}

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '0.5rem',
            marginBottom: '1.5rem',
          }}
        >
          <div
            style={{
              background: streak
                ? 'linear-gradient(135deg, rgba(249, 115, 22, 0.15) 0%, rgba(239, 68, 68, 0.1) 100%)'
                : 'rgba(246, 237, 221, 0.05)',
              padding: '0.75rem',
              borderRadius: '4px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '1.25rem', fontWeight: 500, color: '#f6eddd' }}>
              {streak}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'rgba(246, 237, 221, 0.5)' }}>Day Streak</div>
          </div>
          <div
            style={{
              background: 'rgba(246, 237, 221, 0.05)',
              padding: '0.75rem',
              borderRadius: '4px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '1.25rem', fontWeight: 500, color: '#f6eddd' }}>
              {stats?.totalWorkouts || 0}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'rgba(246, 237, 221, 0.5)' }}>Workouts</div>
          </div>
          <div
            style={{
              background: 'rgba(246, 237, 221, 0.05)',
              padding: '0.75rem',
              borderRadius: '4px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '1.25rem', fontWeight: 500, color: '#f6eddd' }}>
              {stats?.weeklyMinutes || 0}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'rgba(246, 237, 221, 0.5)' }}>Min/Week</div>
          </div>
        </div>

        <ul style={{ margin: '0 0 1.5rem', padding: 0, listStyle: 'none' }}>
          {['Quick 10-second logging', 'Streak tracking with goals', 'Share recap cards to Community'].map((feature) => (
            <li
              key={feature}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.8rem',
                color: 'rgba(246, 237, 221, 0.7)',
                marginBottom: '0.5rem',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              {feature}
            </li>
          ))}
        </ul>

        <Link
          href="/track"
          className="btn btn-primary"
          style={{ width: '100%', fontSize: '0.875rem', padding: '0.75rem' }}
        >
          {stats?.totalWorkouts ? 'View My Progress' : 'Start Tracking'}
        </Link>
      </section>

      {isLoggedIn === false && (
        <div style={{ gridColumn: '1 / -1', textAlign: 'center', marginTop: '2rem' }}>
          <p style={{ color: 'rgba(246, 237, 221, 0.6)', marginBottom: '1rem' }}>
            Already a Pilareta customer?
          </p>
          <a href="/api/auth/login" className="btn btn-outline">
            Sign in with your Pilareta account
          </a>
        </div>
      )}
    </>
  );
}
