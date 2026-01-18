'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const GOALS = [
  { value: 'core_stability', label: 'Core Stability', description: 'Deep core strength and control' },
  { value: 'glutes', label: 'Glutes & Hips', description: 'Lower body strength and stability' },
  { value: 'legs', label: 'Legs & Lower Body', description: 'Full lower body workout' },
  { value: 'posture', label: 'Posture', description: 'Alignment and back strength' },
  { value: 'mobility', label: 'Mobility', description: 'Flexibility and range of motion' },
  { value: 'full_body', label: 'Full Body', description: 'Balanced total body session' },
];

const DURATIONS = [
  { value: 15, label: '15 min', description: 'Quick session' },
  { value: 20, label: '20 min', description: 'Short session' },
  { value: 30, label: '30 min', description: 'Standard session' },
  { value: 45, label: '45 min', description: 'Extended session' },
  { value: 60, label: '60 min', description: 'Full session' },
];

const LEVELS = [
  { value: 'beginner', label: 'Beginner', description: 'New to Pilates or returning after a break' },
  { value: 'intermediate', label: 'Intermediate', description: 'Comfortable with basic exercises' },
  { value: 'advanced', label: 'Advanced', description: 'Strong foundation, ready for challenge' },
];

const CONSTRAINTS = [
  { value: 'knee_sensitive', label: 'Knee Sensitivity', icon: '🦵' },
  { value: 'wrist_sensitive', label: 'Wrist Sensitivity', icon: '🤲' },
  { value: 'shoulder_sensitive', label: 'Shoulder Sensitivity', icon: '💪' },
  { value: 'lower_back_sensitive', label: 'Lower Back Sensitivity', icon: '🔙' },
];

export default function SessionBuilderPage() {
  const router = useRouter();
  const [goal, setGoal] = useState('core_stability');
  const [duration, setDuration] = useState(30);
  const [level, setLevel] = useState('beginner');
  const [constraints, setConstraints] = useState<string[]>([]);
  const [isBuilding, setIsBuilding] = useState(false);

  const toggleConstraint = (constraint: string) => {
    setConstraints(prev =>
      prev.includes(constraint)
        ? prev.filter(c => c !== constraint)
        : [...prev, constraint]
    );
  };

  const handleBuildSession = async () => {
    setIsBuilding(true);

    try {
      const response = await fetch('/api/learn/build-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal, duration, level, constraints }),
      });

      if (!response.ok) {
        throw new Error('Failed to build session');
      }

      const data = await response.json();
      router.push(`/learn/session/${data.sessionId}`);
    } catch (error) {
      console.error('Error building session:', error);
      setIsBuilding(false);
    }
  };

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '3rem' }}>
      <div style={{ maxWidth: '42rem', margin: '0 auto' }}>
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
          <h1 style={{ marginBottom: '0.5rem' }}>Build Your Session</h1>
          <p style={{ color: 'rgba(246, 237, 221, 0.6)', lineHeight: 1.6 }}>
            Tell us your goals and we&apos;ll create a personalized Pilates session for you.
          </p>
        </div>

        {/* Goal Selection */}
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 500, marginBottom: '0.25rem' }}>What&apos;s your focus today?</h2>
          <p style={{ fontSize: '0.875rem', color: 'rgba(246, 237, 221, 0.6)', marginBottom: '1rem' }}>
            Choose the primary goal for your session.
          </p>
          <div style={{ display: 'grid', gap: '0.75rem', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}>
            {GOALS.map((g) => (
              <button
                key={g.value}
                onClick={() => setGoal(g.value)}
                style={{
                  padding: '1rem',
                  borderRadius: '0.75rem',
                  border: `1px solid ${goal === g.value ? 'rgba(246, 237, 221, 0.5)' : 'rgba(246, 237, 221, 0.1)'}`,
                  background: goal === g.value ? 'rgba(246, 237, 221, 0.1)' : 'transparent',
                  color: 'inherit',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ fontWeight: 500, marginBottom: '0.25rem' }}>{g.label}</div>
                <div style={{ fontSize: '0.75rem', color: 'rgba(246, 237, 221, 0.6)' }}>{g.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Duration Selection */}
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 500, marginBottom: '0.25rem' }}>How much time do you have?</h2>
          <p style={{ fontSize: '0.875rem', color: 'rgba(246, 237, 221, 0.6)', marginBottom: '1rem' }}>
            Select your session duration.
          </p>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {DURATIONS.map((d) => (
              <button
                key={d.value}
                onClick={() => setDuration(d.value)}
                style={{
                  padding: '0.75rem 1.25rem',
                  borderRadius: '9999px',
                  border: `1px solid ${duration === d.value ? 'rgba(246, 237, 221, 0.5)' : 'rgba(246, 237, 221, 0.1)'}`,
                  background: duration === d.value ? 'rgba(246, 237, 221, 0.1)' : 'transparent',
                  color: 'inherit',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  fontWeight: duration === d.value ? 500 : 400
                }}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        {/* Level Selection */}
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 500, marginBottom: '0.25rem' }}>What&apos;s your experience level?</h2>
          <p style={{ fontSize: '0.875rem', color: 'rgba(246, 237, 221, 0.6)', marginBottom: '1rem' }}>
            We&apos;ll adjust exercise selection and intensity accordingly.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {LEVELS.map((l) => (
              <button
                key={l.value}
                onClick={() => setLevel(l.value)}
                style={{
                  padding: '1rem',
                  borderRadius: '0.75rem',
                  border: `1px solid ${level === l.value ? 'rgba(246, 237, 221, 0.5)' : 'rgba(246, 237, 221, 0.1)'}`,
                  background: level === l.value ? 'rgba(246, 237, 221, 0.1)' : 'transparent',
                  color: 'inherit',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ fontWeight: 500 }}>{l.label}</div>
                  <div style={{ fontSize: '0.8125rem', color: 'rgba(246, 237, 221, 0.6)' }}>{l.description}</div>
                </div>
                {level === l.value && (
                  <svg style={{ width: '1.25rem', height: '1.25rem', opacity: 0.7 }} fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Constraints */}
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 500, marginBottom: '0.25rem' }}>Any physical considerations?</h2>
          <p style={{ fontSize: '0.875rem', color: 'rgba(246, 237, 221, 0.6)', marginBottom: '1rem' }}>
            Select any areas where you need modifications. We&apos;ll avoid exercises that may cause discomfort.
          </p>
          <div style={{ display: 'grid', gap: '0.5rem', gridTemplateColumns: 'repeat(2, 1fr)' }}>
            {CONSTRAINTS.map((c) => (
              <button
                key={c.value}
                onClick={() => toggleConstraint(c.value)}
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: '0.75rem',
                  border: `1px solid ${constraints.includes(c.value) ? 'rgba(246, 237, 221, 0.5)' : 'rgba(246, 237, 221, 0.1)'}`,
                  background: constraints.includes(c.value) ? 'rgba(246, 237, 221, 0.1)' : 'transparent',
                  color: 'inherit',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.875rem'
                }}
              >
                <span>{c.icon}</span>
                <span>{c.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Summary & Build Button */}
        <div className="card" style={{
          background: 'rgba(246, 237, 221, 0.05)',
          borderColor: 'rgba(246, 237, 221, 0.2)'
        }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 500, marginBottom: '1rem' }}>Your Session Summary</h2>
          <div style={{ display: 'grid', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
              <span style={{ color: 'rgba(246, 237, 221, 0.6)' }}>Goal</span>
              <span style={{ fontWeight: 500 }}>{GOALS.find(g => g.value === goal)?.label}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
              <span style={{ color: 'rgba(246, 237, 221, 0.6)' }}>Duration</span>
              <span style={{ fontWeight: 500 }}>{duration} minutes</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
              <span style={{ color: 'rgba(246, 237, 221, 0.6)' }}>Level</span>
              <span style={{ fontWeight: 500 }}>{LEVELS.find(l => l.value === level)?.label}</span>
            </div>
            {constraints.length > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', alignItems: 'flex-start' }}>
                <span style={{ color: 'rgba(246, 237, 221, 0.6)' }}>Considerations</span>
                <span style={{ fontWeight: 500, textAlign: 'right' }}>
                  {constraints.map(c => CONSTRAINTS.find(x => x.value === c)?.label).join(', ')}
                </span>
              </div>
            )}
          </div>
          <button
            onClick={handleBuildSession}
            disabled={isBuilding}
            className="btn btn-primary"
            style={{
              width: '100%',
              padding: '1rem',
              fontSize: '1rem',
              opacity: isBuilding ? 0.7 : 1,
              cursor: isBuilding ? 'wait' : 'pointer'
            }}
          >
            {isBuilding ? 'Building your session...' : 'Build My Session'}
          </button>
        </div>
      </div>
    </div>
  );
}
