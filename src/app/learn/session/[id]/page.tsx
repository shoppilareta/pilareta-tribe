'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface Exercise {
  id: string;
  name: string;
  slug: string;
  description: string;
  setupSteps: string[];
  executionSteps: string[];
  cues: string[];
  commonMistakes: string[];
  modifications: { easier: string[]; harder: string[] };
  springSuggestion: string | null;
  primaryMuscles: string[];
  secondaryMuscles: string[];
}

interface SessionItem {
  id: string;
  orderIndex: number;
  section: string;
  sets: number;
  reps: number | null;
  duration: number | null;
  tempo: string | null;
  restSeconds: number;
  springSetting: string | null;
  rpeTarget: number;
  showCues: string[];
  showMistakes: string[];
  exercise: Exercise;
}

interface Session {
  id: string;
  name: string;
  description: string | null;
  goal: string;
  level: string;
  durationMinutes: number;
  focusAreas: string[];
  totalSets: number;
  totalReps: number | null;
  rpeTarget: number;
  rationale: string[];
  items: SessionItem[];
}

const SECTION_LABELS: Record<string, string> = {
  warmup: 'Warm Up',
  activation: 'Activation',
  main: 'Main Work',
  cooldown: 'Cool Down',
};

const SECTION_COLORS: Record<string, string> = {
  warmup: 'rgba(255, 200, 100, 0.3)',
  activation: 'rgba(100, 200, 255, 0.3)',
  main: 'rgba(255, 100, 150, 0.3)',
  cooldown: 'rgba(150, 255, 150, 0.3)',
};

export default function SessionPlayerPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;

  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showDetails, setShowDetails] = useState(false);
  const [currentSet, setCurrentSet] = useState(1);
  const [isResting, setIsResting] = useState(false);
  const [restTime, setRestTime] = useState(0);

  useEffect(() => {
    async function fetchSession() {
      try {
        const response = await fetch(`/api/learn/session/${sessionId}`);
        if (!response.ok) throw new Error('Failed to load session');
        const data = await response.json();
        setSession(data.session);
      } catch (error) {
        console.error('Error loading session:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchSession();
  }, [sessionId]);

  // Rest timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isResting && restTime > 0) {
      interval = setInterval(() => {
        setRestTime(prev => {
          if (prev <= 1) {
            setIsResting(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isResting, restTime]);

  const currentItem = session?.items[currentIndex];
  const progress = session ? ((currentIndex + 1) / session.items.length) * 100 : 0;

  const handleNext = useCallback(() => {
    if (!session || !currentItem) return;

    if (currentSet < currentItem.sets) {
      // More sets to go - start rest
      setCurrentSet(prev => prev + 1);
      setIsResting(true);
      setRestTime(currentItem.restSeconds);
    } else if (currentIndex < session.items.length - 1) {
      // Move to next exercise
      setCurrentIndex(prev => prev + 1);
      setCurrentSet(1);
      setIsResting(false);
    } else {
      // Session complete
      router.push(`/learn/session/${sessionId}/complete`);
    }
  }, [session, currentItem, currentSet, currentIndex, sessionId, router]);

  const handlePrev = () => {
    if (currentSet > 1) {
      setCurrentSet(prev => prev - 1);
    } else if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      const prevItem = session?.items[currentIndex - 1];
      setCurrentSet(prevItem?.sets || 1);
    }
    setIsResting(false);
  };

  const skipRest = () => {
    setIsResting(false);
    setRestTime(0);
  };

  if (loading) {
    return (
      <div className="container" style={{ paddingTop: '3rem', paddingBottom: '3rem' }}>
        <div style={{ maxWidth: '42rem', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ animation: 'pulse 2s infinite' }}>Loading session...</div>
        </div>
      </div>
    );
  }

  if (!session || !currentItem) {
    return (
      <div className="container" style={{ paddingTop: '3rem', paddingBottom: '3rem' }}>
        <div style={{ maxWidth: '42rem', margin: '0 auto', textAlign: 'center' }}>
          <h1 style={{ marginBottom: '1rem' }}>Session Not Found</h1>
          <p style={{ color: 'rgba(246, 237, 221, 0.6)', marginBottom: '2rem' }}>
            This session may have expired or doesn&apos;t exist.
          </p>
          <Link href="/learn/builder" className="btn btn-primary">
            Build a New Session
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Progress Bar */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '4px',
        background: 'rgba(246, 237, 221, 0.1)',
        zIndex: 100
      }}>
        <div style={{
          height: '100%',
          width: `${progress}%`,
          background: '#f6eddd',
          transition: 'width 0.3s ease'
        }} />
      </div>

      {/* Header */}
      <header style={{
        padding: '1rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid rgba(246, 237, 221, 0.1)'
      }}>
        <Link href="/learn" style={{ color: 'inherit', textDecoration: 'none' }}>
          <svg style={{ width: '1.5rem', height: '1.5rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </Link>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.75rem', color: 'rgba(246, 237, 221, 0.6)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {SECTION_LABELS[currentItem.section]}
          </div>
          <div style={{ fontSize: '0.875rem' }}>
            {currentIndex + 1} / {session.items.length}
          </div>
        </div>
        <button
          onClick={() => setShowDetails(!showDetails)}
          style={{
            background: 'none',
            border: 'none',
            color: 'inherit',
            cursor: 'pointer',
            padding: '0.5rem'
          }}
        >
          <svg style={{ width: '1.5rem', height: '1.5rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
      </header>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '1.5rem', overflowY: 'auto' }}>
        <div style={{ maxWidth: '42rem', margin: '0 auto' }}>
          {/* Rest Screen */}
          {isResting && (
            <div style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(32, 34, 25, 0.95)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 50
            }}>
              <div style={{ fontSize: '0.875rem', color: 'rgba(246, 237, 221, 0.6)', marginBottom: '0.5rem' }}>
                REST
              </div>
              <div style={{ fontSize: '4rem', fontWeight: 300, marginBottom: '0.5rem' }}>
                {restTime}
              </div>
              <div style={{ fontSize: '0.875rem', color: 'rgba(246, 237, 221, 0.6)', marginBottom: '2rem' }}>
                seconds
              </div>
              <div style={{ fontSize: '0.875rem', marginBottom: '1rem' }}>
                Next: Set {currentSet} of {currentItem.sets}
              </div>
              <button
                onClick={skipRest}
                style={{
                  background: 'rgba(246, 237, 221, 0.1)',
                  border: '1px solid rgba(246, 237, 221, 0.2)',
                  color: 'inherit',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '9999px',
                  cursor: 'pointer'
                }}
              >
                Skip Rest
              </button>
            </div>
          )}

          {/* Section Badge */}
          <div style={{
            display: 'inline-block',
            padding: '0.25rem 0.75rem',
            borderRadius: '9999px',
            background: SECTION_COLORS[currentItem.section],
            fontSize: '0.75rem',
            marginBottom: '1rem'
          }}>
            {SECTION_LABELS[currentItem.section]}
          </div>

          {/* Exercise Name */}
          <h1 style={{ fontSize: '1.75rem', fontWeight: 500, marginBottom: '0.5rem' }}>
            {currentItem.exercise.name}
          </h1>

          {/* Sets/Reps */}
          <div style={{
            display: 'flex',
            gap: '1.5rem',
            marginBottom: '1.5rem',
            color: 'rgba(246, 237, 221, 0.7)'
          }}>
            <div>
              <span style={{ fontWeight: 500, color: '#f6eddd' }}>Set {currentSet}</span> of {currentItem.sets}
            </div>
            {currentItem.reps && (
              <div>
                <span style={{ fontWeight: 500, color: '#f6eddd' }}>{currentItem.reps}</span> reps
              </div>
            )}
            {currentItem.duration && (
              <div>
                <span style={{ fontWeight: 500, color: '#f6eddd' }}>{currentItem.duration}</span> sec
              </div>
            )}
            {currentItem.tempo && (
              <div>
                <span style={{ fontWeight: 500, color: '#f6eddd' }}>{currentItem.tempo}</span> tempo
              </div>
            )}
          </div>

          {/* Spring Setting */}
          {currentItem.springSetting && (
            <div style={{
              padding: '0.75rem 1rem',
              background: 'rgba(246, 237, 221, 0.05)',
              borderRadius: '0.5rem',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <svg style={{ width: '1.25rem', height: '1.25rem', opacity: 0.6 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span style={{ fontSize: '0.875rem' }}>Springs: {currentItem.springSetting}</span>
            </div>
          )}

          {/* Key Cues */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.75rem', color: 'rgba(246, 237, 221, 0.6)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Key Cues
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {currentItem.showCues.map((cue, i) => (
                <div key={i} style={{
                  padding: '0.75rem 1rem',
                  background: 'rgba(246, 237, 221, 0.05)',
                  borderRadius: '0.5rem',
                  fontSize: '0.9375rem',
                  lineHeight: 1.5,
                  display: 'flex',
                  gap: '0.75rem',
                  alignItems: 'flex-start'
                }}>
                  <span style={{ color: 'rgba(246, 237, 221, 0.4)' }}>{i + 1}</span>
                  {cue}
                </div>
              ))}
            </div>
          </div>

          {/* Detailed Info (collapsible) */}
          {showDetails && (
            <div style={{
              borderTop: '1px solid rgba(246, 237, 221, 0.1)',
              paddingTop: '1.5rem',
              marginBottom: '1.5rem'
            }}>
              {/* Description */}
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem', color: 'rgba(246, 237, 221, 0.6)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  About This Exercise
                </h3>
                <p style={{ fontSize: '0.9375rem', lineHeight: 1.6, color: 'rgba(246, 237, 221, 0.8)' }}>
                  {currentItem.exercise.description}
                </p>
              </div>

              {/* Setup */}
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem', color: 'rgba(246, 237, 221, 0.6)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Setup
                </h3>
                <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
                  {currentItem.exercise.setupSteps.map((step, i) => (
                    <li key={i} style={{ marginBottom: '0.5rem', fontSize: '0.9375rem', lineHeight: 1.5 }}>{step}</li>
                  ))}
                </ul>
              </div>

              {/* Execution */}
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem', color: 'rgba(246, 237, 221, 0.6)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Execution
                </h3>
                <ol style={{ margin: 0, paddingLeft: '1.25rem' }}>
                  {currentItem.exercise.executionSteps.map((step, i) => (
                    <li key={i} style={{ marginBottom: '0.5rem', fontSize: '0.9375rem', lineHeight: 1.5 }}>{step}</li>
                  ))}
                </ol>
              </div>

              {/* Common Mistakes */}
              {currentItem.showMistakes.length > 0 && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <h3 style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem', color: 'rgba(246, 237, 221, 0.6)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Avoid These Mistakes
                  </h3>
                  <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
                    {currentItem.showMistakes.map((mistake, i) => (
                      <li key={i} style={{ marginBottom: '0.5rem', fontSize: '0.9375rem', lineHeight: 1.5, color: 'rgba(255, 150, 150, 0.8)' }}>{mistake}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Muscles */}
              <div>
                <h3 style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem', color: 'rgba(246, 237, 221, 0.6)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Muscles Worked
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {currentItem.exercise.primaryMuscles.map((muscle, i) => (
                    <span key={i} style={{
                      padding: '0.25rem 0.5rem',
                      background: 'rgba(246, 237, 221, 0.15)',
                      borderRadius: '9999px',
                      fontSize: '0.75rem'
                    }}>{muscle.replace('_', ' ')}</span>
                  ))}
                  {currentItem.exercise.secondaryMuscles.map((muscle, i) => (
                    <span key={i} style={{
                      padding: '0.25rem 0.5rem',
                      background: 'rgba(246, 237, 221, 0.05)',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      color: 'rgba(246, 237, 221, 0.6)'
                    }}>{muscle.replace('_', ' ')}</span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Navigation Footer */}
      <footer style={{
        padding: '1rem',
        borderTop: '1px solid rgba(246, 237, 221, 0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '1rem'
      }}>
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0 && currentSet === 1}
          style={{
            padding: '0.75rem 1.5rem',
            background: 'transparent',
            border: '1px solid rgba(246, 237, 221, 0.2)',
            borderRadius: '9999px',
            color: 'inherit',
            cursor: currentIndex === 0 && currentSet === 1 ? 'not-allowed' : 'pointer',
            opacity: currentIndex === 0 && currentSet === 1 ? 0.5 : 1
          }}
        >
          Previous
        </button>
        <button
          onClick={handleNext}
          style={{
            padding: '0.75rem 2rem',
            background: '#f6eddd',
            border: 'none',
            borderRadius: '9999px',
            color: '#202219',
            cursor: 'pointer',
            fontWeight: 500
          }}
        >
          {currentSet < currentItem.sets
            ? 'Next Set'
            : currentIndex < session.items.length - 1
            ? 'Next Exercise'
            : 'Complete Session'}
        </button>
      </footer>
    </div>
  );
}
