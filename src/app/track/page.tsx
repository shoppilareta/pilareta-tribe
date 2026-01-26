'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { TrackDashboard } from '@/components/track/TrackDashboard';
import { QuickLogModal } from '@/components/track/QuickLogModal';

interface UserSession {
  userId: string;
  firstName?: string;
}

// Teaser component shown when not logged in
function TrackTeaser() {
  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '3rem' }}>
      <div style={{ maxWidth: '56rem', margin: '0 auto' }}>
        {/* Hero */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{
            fontSize: '3rem',
            marginBottom: '1rem'
          }}>
            🔥
          </div>
          <h1 style={{ fontSize: 'clamp(2rem, 4vw, 2.75rem)', marginBottom: '1rem' }}>
            Track Your Pilates Journey
          </h1>
          <p style={{ color: 'rgba(246, 237, 221, 0.6)', maxWidth: '32rem', margin: '0 auto', lineHeight: 1.6 }}>
            Log your workouts in seconds, build streaks, and see your progress over time.
            Connect with the community by sharing your achievements.
          </p>
        </div>

        {/* Preview Stats (Demo) */}
        <div style={{
          display: 'grid',
          gap: '1rem',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          marginBottom: '2rem'
        }}>
          {[
            { label: 'Day Streak', value: '14', icon: '🔥' },
            { label: 'This Week', value: '3h 45m', icon: '📅' },
            { label: 'Total Workouts', value: '47', icon: '✓' },
            { label: 'Consistency', value: '85%', icon: '📈' }
          ].map((stat) => (
            <div
              key={stat.label}
              className="card"
              style={{
                padding: '1.25rem',
                textAlign: 'center',
                opacity: 0.7
              }}
            >
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{stat.icon}</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                {stat.value}
              </div>
              <div style={{
                fontSize: '0.75rem',
                color: 'rgba(246, 237, 221, 0.5)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Feature Cards */}
        <div style={{
          display: 'grid',
          gap: '1.5rem',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          marginBottom: '3rem'
        }}>
          {/* Quick Logging */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{
              width: '3rem',
              height: '3rem',
              borderRadius: '0.75rem',
              background: 'rgba(246, 237, 221, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem',
              fontSize: '1.5rem'
            }}>
              ⚡
            </div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 500, marginBottom: '0.5rem' }}>
              Quick Logging
            </h3>
            <p style={{ color: 'rgba(246, 237, 221, 0.6)', fontSize: '0.875rem', lineHeight: 1.6 }}>
              Log your workout in under 20 seconds. Just tap duration, type, and intensity - done!
            </p>
          </div>

          {/* Streak Tracking */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{
              width: '3rem',
              height: '3rem',
              borderRadius: '0.75rem',
              background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.2) 0%, rgba(239, 68, 68, 0.15) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem',
              fontSize: '1.5rem'
            }}>
              🔥
            </div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 500, marginBottom: '0.5rem' }}>
              Build Your Streak
            </h3>
            <p style={{ color: 'rgba(246, 237, 221, 0.6)', fontSize: '0.875rem', lineHeight: 1.6 }}>
              Stay consistent with streak tracking. Miss a day? You have a 24-hour grace period.
            </p>
          </div>

          {/* Share to Community */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{
              width: '3rem',
              height: '3rem',
              borderRadius: '0.75rem',
              background: 'rgba(246, 237, 221, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem',
              fontSize: '1.5rem'
            }}>
              📤
            </div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 500, marginBottom: '0.5rem' }}>
              Share Your Wins
            </h3>
            <p style={{ color: 'rgba(246, 237, 221, 0.6)', fontSize: '0.875rem', lineHeight: 1.6 }}>
              Create beautiful recap cards to share on Instagram, WhatsApp, or the Tribe community.
            </p>
          </div>
        </div>

        {/* Weekly Progress Preview */}
        <div className="card" style={{ marginBottom: '2rem', padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 500, marginBottom: '1rem', textAlign: 'center' }}>
            Weekly Progress View
          </h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem', maxWidth: '350px', margin: '0 auto' }}>
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => {
              const filled = i < 4; // Demo: first 4 days filled
              return (
                <div key={day} style={{ flex: 1, textAlign: 'center' }}>
                  <div style={{
                    width: '2.5rem',
                    height: '2.5rem',
                    borderRadius: '50%',
                    margin: '0 auto 0.375rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: filled
                      ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.8) 0%, rgba(22, 163, 74, 0.8) 100%)'
                      : 'rgba(246, 237, 221, 0.1)',
                    opacity: 0.7
                  }}>
                    {filled && (
                      <svg style={{ width: '1rem', height: '1rem', color: '#fff' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <div style={{ fontSize: '0.6875rem', color: 'rgba(246, 237, 221, 0.5)' }}>{day}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA */}
        <div style={{ textAlign: 'center' }}>
          <a
            href="/api/auth/login?redirect=/track"
            className="btn btn-primary"
            style={{
              fontSize: '1rem',
              padding: '0.875rem 2rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            Sign In to Start Tracking
            <svg style={{ width: '1.25rem', height: '1.25rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
          <p style={{
            marginTop: '1rem',
            fontSize: '0.8125rem',
            color: 'rgba(246, 237, 221, 0.5)'
          }}>
            Free with your Pilareta account
          </p>
        </div>

        {/* Back */}
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <Link href="/" style={{ color: 'rgba(246, 237, 221, 0.6)', fontSize: '0.875rem', textDecoration: 'none' }}>
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function TrackPage() {
  const [session, setSession] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLogModal, setShowLogModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    async function checkAuth() {
      try {
        const response = await fetch('/api/user');
        if (response.ok) {
          const data = await response.json();
          if (data.user) {
            setSession({ userId: data.user.id, firstName: data.user.firstName });
          }
        }
      } catch {
        // Not logged in - will show teaser
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, []);

  const handleLogComplete = () => {
    setShowLogModal(false);
    setRefreshKey((k) => k + 1);
  };

  if (loading) {
    return (
      <div className="container" style={{ paddingTop: '3rem', paddingBottom: '3rem' }}>
        <div style={{ maxWidth: '64rem', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ opacity: 0.6 }}>Loading...</div>
        </div>
      </div>
    );
  }

  // Show teaser if not logged in
  if (!session) {
    return <TrackTeaser />;
  }

  return (
    <>
      <TrackDashboard
        userId={session.userId}
        firstName={session.firstName}
        onLogWorkout={() => setShowLogModal(true)}
        refreshKey={refreshKey}
      />

      {showLogModal && (
        <QuickLogModal
          onClose={() => setShowLogModal(false)}
          onComplete={handleLogComplete}
        />
      )}
    </>
  );
}
