'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Program {
  id: string;
  slug: string;
  name: string;
  description: string;
  durationWeeks: number;
  sessionsPerWeek: number;
  equipment: string;
  level: string;
  focusAreas: string[];
  benefits: string[];
  isPublished: boolean;
}

const LEVEL_LABELS: Record<string, { label: string; color: string }> = {
  beginner: { label: 'Beginner', color: 'rgba(150, 255, 150, 0.3)' },
  intermediate: { label: 'Intermediate', color: 'rgba(255, 200, 100, 0.3)' },
  advanced: { label: 'Advanced', color: 'rgba(255, 100, 150, 0.3)' },
};

export default function ProgramsPage() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPrograms() {
      try {
        const response = await fetch('/api/learn/programs');
        if (response.ok) {
          const data = await response.json();
          setPrograms(data.programs);
        }
      } catch (error) {
        console.error('Error loading programs:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchPrograms();
  }, []);

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '3rem' }}>
      <div style={{ maxWidth: '56rem', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <Link
            href="/learn"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: 'rgba(246, 237, 221, 0.6)',
              fontSize: '0.875rem',
              marginBottom: '1rem',
              textDecoration: 'none'
            }}
          >
            <svg style={{ width: '1rem', height: '1rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Learn
          </Link>
          <h1 style={{ marginBottom: '0.5rem' }}>Programs</h1>
          <p style={{ color: 'rgba(246, 237, 221, 0.6)', lineHeight: 1.6 }}>
            Follow a structured 4-week program with progressive sessions designed to help you achieve specific goals.
          </p>
        </div>

        {/* Program Cards */}
        {loading ? (
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            {[1, 2].map((i) => (
              <div key={i} className="card" style={{ opacity: 0.5, animation: 'pulse 2s infinite' }}>
                <div style={{ height: '1.5rem', background: 'rgba(246, 237, 221, 0.1)', borderRadius: '0.25rem', marginBottom: '0.75rem', width: '40%' }} />
                <div style={{ height: '1rem', background: 'rgba(246, 237, 221, 0.1)', borderRadius: '0.25rem', marginBottom: '0.5rem', width: '100%' }} />
                <div style={{ height: '1rem', background: 'rgba(246, 237, 221, 0.1)', borderRadius: '0.25rem', width: '80%' }} />
              </div>
            ))}
          </div>
        ) : programs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
            <p style={{ color: 'rgba(246, 237, 221, 0.6)', marginBottom: '1rem' }}>
              No programs available yet.
            </p>
            <Link href="/learn/builder" className="btn btn-primary">
              Build a Custom Session
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            {programs.map((program) => (
              <Link
                key={program.id}
                href={`/learn/programs/${program.slug}`}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <div
                  className="card"
                  style={{
                    cursor: 'pointer',
                    transition: 'transform 0.2s ease, border-color 0.2s ease',
                    borderWidth: '1px',
                    borderStyle: 'solid',
                    borderColor: 'rgba(246, 237, 221, 0.1)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.borderColor = 'rgba(246, 237, 221, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.borderColor = 'rgba(246, 237, 221, 0.1)';
                  }}
                >
                  {/* Header Row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div>
                      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <span style={{
                          padding: '0.25rem 0.5rem',
                          borderRadius: '9999px',
                          background: LEVEL_LABELS[program.level]?.color || 'rgba(246, 237, 221, 0.1)',
                          fontSize: '0.75rem'
                        }}>
                          {LEVEL_LABELS[program.level]?.label || program.level}
                        </span>
                        <span style={{
                          padding: '0.25rem 0.5rem',
                          borderRadius: '9999px',
                          background: 'rgba(246, 237, 221, 0.1)',
                          fontSize: '0.75rem'
                        }}>
                          {program.equipment}
                        </span>
                      </div>
                      <h2 style={{ fontSize: '1.25rem', fontWeight: 500 }}>{program.name}</h2>
                    </div>
                    <svg style={{ width: '1.5rem', height: '1.5rem', opacity: 0.5, flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>

                  {/* Description */}
                  <p style={{
                    color: 'rgba(246, 237, 221, 0.7)',
                    lineHeight: 1.6,
                    marginBottom: '1rem',
                    fontSize: '0.9375rem'
                  }}>
                    {program.description}
                  </p>

                  {/* Stats Row */}
                  <div style={{
                    display: 'flex',
                    gap: '2rem',
                    paddingTop: '1rem',
                    borderTop: '1px solid rgba(246, 237, 221, 0.1)'
                  }}>
                    <div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 500 }}>{program.durationWeeks}</div>
                      <div style={{ fontSize: '0.75rem', color: 'rgba(246, 237, 221, 0.6)' }}>weeks</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 500 }}>{program.sessionsPerWeek}</div>
                      <div style={{ fontSize: '0.75rem', color: 'rgba(246, 237, 221, 0.6)' }}>sessions/week</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 500 }}>{program.durationWeeks * program.sessionsPerWeek}</div>
                      <div style={{ fontSize: '0.75rem', color: 'rgba(246, 237, 221, 0.6)' }}>total sessions</div>
                    </div>
                  </div>

                  {/* Focus Areas */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '1rem' }}>
                    {program.focusAreas.map((area, i) => (
                      <span
                        key={i}
                        style={{
                          padding: '0.25rem 0.5rem',
                          background: 'rgba(246, 237, 221, 0.05)',
                          borderRadius: '9999px',
                          fontSize: '0.75rem',
                          color: 'rgba(246, 237, 221, 0.6)'
                        }}
                      >
                        {area}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Build Custom CTA */}
        {!loading && programs.length > 0 && (
          <div style={{ marginTop: '2rem', textAlign: 'center' }}>
            <p style={{ color: 'rgba(246, 237, 221, 0.6)', marginBottom: '1rem', fontSize: '0.875rem' }}>
              Want something different?
            </p>
            <Link href="/learn/builder" className="btn btn-outline">
              Build a Custom Session
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
