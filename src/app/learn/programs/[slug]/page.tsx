'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface Exercise {
  id: string;
  name: string;
  slug: string;
}

interface TemplateItem {
  id: string;
  orderIndex: number;
  section: string;
  sets: number;
  reps: number | null;
  duration: number | null;
  exercise: Exercise;
}

interface SessionTemplate {
  id: string;
  name: string;
  durationMinutes: number;
  items: TemplateItem[];
}

interface ProgramSession {
  id: string;
  dayNumber: number;
  title: string | null;
  template: SessionTemplate | null;
}

interface ProgramWeek {
  id: string;
  weekNumber: number;
  title: string | null;
  focus: string | null;
  repsMultiplier: number;
  intensityNotes: string | null;
  sessions: ProgramSession[];
}

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
  progressionType: string;
  progressionNotes: string | null;
  benefits: string[];
  prerequisites: string | null;
  weeks: ProgramWeek[];
}

const LEVEL_LABELS: Record<string, { label: string; color: string }> = {
  beginner: { label: 'Beginner', color: 'rgba(150, 255, 150, 0.3)' },
  intermediate: { label: 'Intermediate', color: 'rgba(255, 200, 100, 0.3)' },
  advanced: { label: 'Advanced', color: 'rgba(255, 100, 150, 0.3)' },
};

const SECTION_LABELS: Record<string, string> = {
  warmup: 'Warmup',
  activation: 'Activation',
  main: 'Main',
  cooldown: 'Cooldown',
};

export default function ProgramDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [program, setProgram] = useState<Program | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedWeek, setExpandedWeek] = useState<number | null>(1);
  const [expandedSession, setExpandedSession] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProgram() {
      try {
        const response = await fetch(`/api/learn/programs/${slug}`);
        if (response.ok) {
          const data = await response.json();
          setProgram(data.program);
        }
      } catch (error) {
        console.error('Error loading program:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchProgram();
  }, [slug]);

  if (loading) {
    return (
      <div className="container" style={{ paddingTop: '3rem', paddingBottom: '3rem' }}>
        <div style={{ maxWidth: '42rem', margin: '0 auto' }}>
          <div style={{ animation: 'pulse 2s infinite' }}>Loading program...</div>
        </div>
      </div>
    );
  }

  if (!program) {
    return (
      <div className="container" style={{ paddingTop: '3rem', paddingBottom: '3rem' }}>
        <div style={{ maxWidth: '42rem', margin: '0 auto', textAlign: 'center' }}>
          <h1 style={{ marginBottom: '1rem' }}>Program Not Found</h1>
          <p style={{ color: 'rgba(246, 237, 221, 0.6)', marginBottom: '2rem' }}>
            This program may not exist or is no longer available.
          </p>
          <Link href="/learn/programs" className="btn btn-primary">
            Browse Programs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '3rem' }}>
      <div style={{ maxWidth: '48rem', margin: '0 auto' }}>
        {/* Back Link */}
        <Link
          href="/learn/programs"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: 'rgba(246, 237, 221, 0.6)',
            fontSize: '0.875rem',
            marginBottom: '1.5rem',
            textDecoration: 'none'
          }}
        >
          <svg style={{ width: '1rem', height: '1rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          All Programs
        </Link>

        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
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
          <h1 style={{ fontSize: '1.75rem', fontWeight: 500, marginBottom: '0.75rem' }}>
            {program.name}
          </h1>
          <p style={{ color: 'rgba(246, 237, 221, 0.7)', lineHeight: 1.6 }}>
            {program.description}
          </p>
        </div>

        {/* Stats */}
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', textAlign: 'center' }}>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 500 }}>{program.durationWeeks}</div>
              <div style={{ fontSize: '0.75rem', color: 'rgba(246, 237, 221, 0.6)' }}>weeks</div>
            </div>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 500 }}>{program.sessionsPerWeek}</div>
              <div style={{ fontSize: '0.75rem', color: 'rgba(246, 237, 221, 0.6)' }}>per week</div>
            </div>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 500 }}>{program.durationWeeks * program.sessionsPerWeek}</div>
              <div style={{ fontSize: '0.75rem', color: 'rgba(246, 237, 221, 0.6)' }}>sessions</div>
            </div>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 500 }}>~30</div>
              <div style={{ fontSize: '0.75rem', color: 'rgba(246, 237, 221, 0.6)' }}>min each</div>
            </div>
          </div>
        </div>

        {/* Benefits */}
        {program.benefits.length > 0 && (
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 500, marginBottom: '1rem' }}>What You&apos;ll Gain</h2>
            <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
              {program.benefits.map((benefit, i) => (
                <li key={i} style={{ marginBottom: '0.5rem', lineHeight: 1.5 }}>{benefit}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Progression Info */}
        {program.progressionNotes && (
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 500, marginBottom: '0.75rem' }}>Progression</h2>
            <p style={{ color: 'rgba(246, 237, 221, 0.7)', lineHeight: 1.6, fontSize: '0.9375rem' }}>
              {program.progressionNotes}
            </p>
          </div>
        )}

        {/* Prerequisites */}
        {program.prerequisites && (
          <div className="card" style={{ marginBottom: '2rem', background: 'rgba(246, 237, 221, 0.05)' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 500, marginBottom: '0.5rem' }}>Prerequisites</h2>
            <p style={{ color: 'rgba(246, 237, 221, 0.7)', lineHeight: 1.6, fontSize: '0.9375rem' }}>
              {program.prerequisites}
            </p>
          </div>
        )}

        {/* Weekly Schedule */}
        <h2 style={{ fontSize: '1.25rem', fontWeight: 500, marginBottom: '1rem' }}>Weekly Schedule</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {program.weeks.map((week) => (
            <div key={week.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
              {/* Week Header */}
              <button
                onClick={() => setExpandedWeek(expandedWeek === week.weekNumber ? null : week.weekNumber)}
                style={{
                  width: '100%',
                  padding: '1rem 1.25rem',
                  background: 'none',
                  border: 'none',
                  color: 'inherit',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  textAlign: 'left'
                }}
              >
                <div>
                  <div style={{ fontWeight: 500, marginBottom: '0.25rem' }}>
                    Week {week.weekNumber}{week.title ? `: ${week.title}` : ''}
                  </div>
                  {week.focus && (
                    <div style={{ fontSize: '0.875rem', color: 'rgba(246, 237, 221, 0.6)' }}>
                      {week.focus}
                    </div>
                  )}
                </div>
                <svg
                  style={{
                    width: '1.25rem',
                    height: '1.25rem',
                    opacity: 0.5,
                    transform: expandedWeek === week.weekNumber ? 'rotate(180deg)' : 'rotate(0)',
                    transition: 'transform 0.2s ease'
                  }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Week Content */}
              {expandedWeek === week.weekNumber && (
                <div style={{
                  padding: '0 1.25rem 1.25rem',
                  borderTop: '1px solid rgba(246, 237, 221, 0.1)'
                }}>
                  {week.intensityNotes && (
                    <div style={{
                      fontSize: '0.8125rem',
                      color: 'rgba(246, 237, 221, 0.6)',
                      padding: '0.75rem 0',
                      borderBottom: '1px solid rgba(246, 237, 221, 0.05)'
                    }}>
                      {week.intensityNotes}
                    </div>
                  )}

                  {/* Sessions */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.75rem' }}>
                    {week.sessions.map((session) => (
                      <div key={session.id}>
                        <button
                          onClick={() => setExpandedSession(expandedSession === session.id ? null : session.id)}
                          style={{
                            width: '100%',
                            padding: '0.75rem 1rem',
                            background: 'rgba(246, 237, 221, 0.05)',
                            border: 'none',
                            borderRadius: '0.5rem',
                            color: 'inherit',
                            cursor: 'pointer',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            textAlign: 'left'
                          }}
                        >
                          <div>
                            <span style={{ fontWeight: 500 }}>Day {session.dayNumber}</span>
                            {session.title && (
                              <span style={{ color: 'rgba(246, 237, 221, 0.6)', marginLeft: '0.5rem' }}>
                                {session.title}
                              </span>
                            )}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            {session.template && (
                              <span style={{ fontSize: '0.75rem', color: 'rgba(246, 237, 221, 0.5)' }}>
                                {session.template.items.length} exercises
                              </span>
                            )}
                            <svg
                              style={{
                                width: '1rem',
                                height: '1rem',
                                opacity: 0.5,
                                transform: expandedSession === session.id ? 'rotate(180deg)' : 'rotate(0)',
                                transition: 'transform 0.2s ease'
                              }}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </button>

                        {/* Session Exercises */}
                        {expandedSession === session.id && session.template && (
                          <div style={{
                            marginTop: '0.5rem',
                            padding: '0.75rem 1rem',
                            background: 'rgba(246, 237, 221, 0.02)',
                            borderRadius: '0.5rem'
                          }}>
                            {/* Group by section */}
                            {['warmup', 'activation', 'main', 'cooldown'].map((section) => {
                              const sectionItems = session.template!.items.filter(item => item.section === section);
                              if (sectionItems.length === 0) return null;

                              return (
                                <div key={section} style={{ marginBottom: '1rem' }}>
                                  <div style={{
                                    fontSize: '0.6875rem',
                                    color: 'rgba(246, 237, 221, 0.5)',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                    marginBottom: '0.5rem'
                                  }}>
                                    {SECTION_LABELS[section]}
                                  </div>
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                    {sectionItems.map((item) => (
                                      <Link
                                        key={item.id}
                                        href={`/learn/exercises/${item.exercise.slug}`}
                                        style={{
                                          display: 'flex',
                                          justifyContent: 'space-between',
                                          alignItems: 'center',
                                          padding: '0.5rem 0',
                                          color: 'inherit',
                                          textDecoration: 'none',
                                          fontSize: '0.875rem'
                                        }}
                                      >
                                        <span>{item.exercise.name}</span>
                                        <span style={{ color: 'rgba(246, 237, 221, 0.5)', fontSize: '0.75rem' }}>
                                          {item.sets} × {item.reps || `${item.duration}s`}
                                        </span>
                                      </Link>
                                    ))}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Start Program CTA */}
        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <p style={{ color: 'rgba(246, 237, 221, 0.6)', marginBottom: '1rem', fontSize: '0.875rem' }}>
            Ready to begin?
          </p>
          <button className="btn btn-primary" style={{ opacity: 0.6, cursor: 'not-allowed' }} disabled>
            Start Program (Coming Soon)
          </button>
        </div>
      </div>
    </div>
  );
}
