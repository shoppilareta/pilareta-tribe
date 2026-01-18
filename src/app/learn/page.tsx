'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Stats {
  exercises: number;
  programs: number;
  weeks: number;
  sessions: number;
}

export default function LearnPage() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch('/api/learn/stats');
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    }
    fetchStats();
  }, []);

  return (
    <div className="container" style={{ paddingTop: '3rem', paddingBottom: '3rem' }}>
      <div style={{ maxWidth: '56rem', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 style={{ marginBottom: '1rem', fontSize: 'clamp(2rem, 4vw, 3rem)' }}>Learn Pilates</h1>
          <p style={{ color: 'rgba(246, 237, 221, 0.6)', maxWidth: '32rem', margin: '0 auto', lineHeight: 1.6 }}>
            Build personalized sessions, follow progressive programs, or explore our
            comprehensive exercise library. All designed for the reformer.
          </p>
        </div>

        {/* Main Action Cards */}
        <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', marginBottom: '3rem' }}>
          {/* Build a Session */}
          <Link href="/learn/builder" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div
              className="card"
              style={{
                height: '100%',
                cursor: 'pointer',
                transition: 'transform 0.2s ease, border-color 0.2s ease',
                borderWidth: '1px',
                borderStyle: 'solid',
                borderColor: 'rgba(246, 237, 221, 0.1)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.borderColor = 'rgba(246, 237, 221, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'rgba(246, 237, 221, 0.1)';
              }}
            >
              <div style={{
                width: '3rem',
                height: '3rem',
                borderRadius: '0.75rem',
                background: 'rgba(246, 237, 221, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem'
              }}>
                <svg style={{ width: '1.5rem', height: '1.5rem', opacity: 0.8 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 500, marginBottom: '0.5rem' }}>Build a Session</h2>
              <p style={{ color: 'rgba(246, 237, 221, 0.6)', fontSize: '0.875rem', lineHeight: 1.6, marginBottom: '1rem' }}>
                Create a personalized Pilates session based on your goals, available time,
                and any physical considerations.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                <span style={{
                  fontSize: '0.75rem',
                  padding: '0.25rem 0.5rem',
                  background: 'rgba(246, 237, 221, 0.1)',
                  borderRadius: '9999px',
                  color: 'rgba(246, 237, 221, 0.7)'
                }}>15-60 min</span>
                <span style={{
                  fontSize: '0.75rem',
                  padding: '0.25rem 0.5rem',
                  background: 'rgba(246, 237, 221, 0.1)',
                  borderRadius: '9999px',
                  color: 'rgba(246, 237, 221, 0.7)'
                }}>Reformer</span>
                <span style={{
                  fontSize: '0.75rem',
                  padding: '0.25rem 0.5rem',
                  background: 'rgba(246, 237, 221, 0.1)',
                  borderRadius: '9999px',
                  color: 'rgba(246, 237, 221, 0.7)'
                }}>All Levels</span>
              </div>
            </div>
          </Link>

          {/* Start a Program */}
          <Link href="/learn/programs" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div
              className="card"
              style={{
                height: '100%',
                cursor: 'pointer',
                transition: 'transform 0.2s ease, border-color 0.2s ease',
                borderWidth: '1px',
                borderStyle: 'solid',
                borderColor: 'rgba(246, 237, 221, 0.1)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.borderColor = 'rgba(246, 237, 221, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'rgba(246, 237, 221, 0.1)';
              }}
            >
              <div style={{
                width: '3rem',
                height: '3rem',
                borderRadius: '0.75rem',
                background: 'rgba(246, 237, 221, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem'
              }}>
                <svg style={{ width: '1.5rem', height: '1.5rem', opacity: 0.8 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 500, marginBottom: '0.5rem' }}>Start a Program</h2>
              <p style={{ color: 'rgba(246, 237, 221, 0.6)', fontSize: '0.875rem', lineHeight: 1.6, marginBottom: '1rem' }}>
                Follow a structured multi-week program with progressive sessions designed
                to build strength, stability, and control.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                <span style={{
                  fontSize: '0.75rem',
                  padding: '0.25rem 0.5rem',
                  background: 'rgba(246, 237, 221, 0.1)',
                  borderRadius: '9999px',
                  color: 'rgba(246, 237, 221, 0.7)'
                }}>{stats ? `${stats.programs} programs` : '...'}</span>
                <span style={{
                  fontSize: '0.75rem',
                  padding: '0.25rem 0.5rem',
                  background: 'rgba(246, 237, 221, 0.1)',
                  borderRadius: '9999px',
                  color: 'rgba(246, 237, 221, 0.7)'
                }}>3x per week</span>
                <span style={{
                  fontSize: '0.75rem',
                  padding: '0.25rem 0.5rem',
                  background: 'rgba(246, 237, 221, 0.1)',
                  borderRadius: '9999px',
                  color: 'rgba(246, 237, 221, 0.7)'
                }}>Progressive</span>
              </div>
            </div>
          </Link>

          {/* Browse Exercises */}
          <Link href="/learn/exercises" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div
              className="card"
              style={{
                height: '100%',
                cursor: 'pointer',
                transition: 'transform 0.2s ease, border-color 0.2s ease',
                borderWidth: '1px',
                borderStyle: 'solid',
                borderColor: 'rgba(246, 237, 221, 0.1)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.borderColor = 'rgba(246, 237, 221, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'rgba(246, 237, 221, 0.1)';
              }}
            >
              <div style={{
                width: '3rem',
                height: '3rem',
                borderRadius: '0.75rem',
                background: 'rgba(246, 237, 221, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem'
              }}>
                <svg style={{ width: '1.5rem', height: '1.5rem', opacity: 0.8 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 500, marginBottom: '0.5rem' }}>Browse Exercises</h2>
              <p style={{ color: 'rgba(246, 237, 221, 0.6)', fontSize: '0.875rem', lineHeight: 1.6, marginBottom: '1rem' }}>
                Explore our comprehensive library of reformer exercises with detailed
                instructions, cues, and modifications.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                <span style={{
                  fontSize: '0.75rem',
                  padding: '0.25rem 0.5rem',
                  background: 'rgba(246, 237, 221, 0.1)',
                  borderRadius: '9999px',
                  color: 'rgba(246, 237, 221, 0.7)'
                }}>{stats ? `${stats.exercises} exercises` : '...'}</span>
                <span style={{
                  fontSize: '0.75rem',
                  padding: '0.25rem 0.5rem',
                  background: 'rgba(246, 237, 221, 0.1)',
                  borderRadius: '9999px',
                  color: 'rgba(246, 237, 221, 0.7)'
                }}>Searchable</span>
                <span style={{
                  fontSize: '0.75rem',
                  padding: '0.25rem 0.5rem',
                  background: 'rgba(246, 237, 221, 0.1)',
                  borderRadius: '9999px',
                  color: 'rgba(246, 237, 221, 0.7)'
                }}>Filterable</span>
              </div>
            </div>
          </Link>
        </div>

        {/* How It Works */}
        <div className="card" style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 500, marginBottom: '1.5rem', textAlign: 'center' }}>How It Works</h2>
          <div style={{ display: 'grid', gap: '2rem', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '2.5rem',
                height: '2.5rem',
                borderRadius: '9999px',
                background: 'rgba(246, 237, 221, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 0.75rem',
                fontSize: '0.875rem',
                fontWeight: 500
              }}>1</div>
              <h3 style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>Set Your Goals</h3>
              <p style={{ color: 'rgba(246, 237, 221, 0.6)', fontSize: '0.8125rem', lineHeight: 1.5 }}>
                Choose your focus area, duration, and any physical considerations.
              </p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '2.5rem',
                height: '2.5rem',
                borderRadius: '9999px',
                background: 'rgba(246, 237, 221, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 0.75rem',
                fontSize: '0.875rem',
                fontWeight: 500
              }}>2</div>
              <h3 style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>Get Your Session</h3>
              <p style={{ color: 'rgba(246, 237, 221, 0.6)', fontSize: '0.8125rem', lineHeight: 1.5 }}>
                We build a personalized sequence with warmup, main work, and cooldown.
              </p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '2.5rem',
                height: '2.5rem',
                borderRadius: '9999px',
                background: 'rgba(246, 237, 221, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 0.75rem',
                fontSize: '0.875rem',
                fontWeight: 500
              }}>3</div>
              <h3 style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>Follow Along</h3>
              <p style={{ color: 'rgba(246, 237, 221, 0.6)', fontSize: '0.8125rem', lineHeight: 1.5 }}>
                Use the player with cues, timers, and exercise guidance.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div style={{
          display: 'grid',
          gap: '1rem',
          gridTemplateColumns: 'repeat(4, 1fr)',
          marginBottom: '2rem',
          textAlign: 'center'
        }}>
          <div style={{ padding: '1rem' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 500, marginBottom: '0.25rem' }}>
              {stats ? stats.exercises : '—'}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'rgba(246, 237, 221, 0.6)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Exercises</div>
          </div>
          <div style={{ padding: '1rem' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 500, marginBottom: '0.25rem' }}>
              {stats ? stats.programs : '—'}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'rgba(246, 237, 221, 0.6)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Programs</div>
          </div>
          <div style={{ padding: '1rem' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 500, marginBottom: '0.25rem' }}>
              {stats ? stats.weeks : '—'}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'rgba(246, 237, 221, 0.6)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Weeks</div>
          </div>
          <div style={{ padding: '1rem' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 500, marginBottom: '0.25rem' }}>
              {stats ? stats.sessions : '—'}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'rgba(246, 237, 221, 0.6)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Sessions</div>
          </div>
        </div>

        {/* Back Button */}
        <div style={{ textAlign: 'center' }}>
          <Link href="/" className="btn btn-outline">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
