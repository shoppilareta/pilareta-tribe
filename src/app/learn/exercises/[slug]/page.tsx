'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';

// Dynamically import 3D viewer to avoid SSR issues and reduce initial bundle
const Exercise3DViewer = dynamic(
  () => import('@/components/Exercise3DViewer').then((mod) => mod.Exercise3DViewer),
  {
    ssr: false,
    loading: () => (
      <div style={{
        height: '320px',
        background: '#1a1a1a',
        borderRadius: '0.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'rgba(246, 237, 221, 0.5)',
        fontSize: '0.875rem'
      }}>
        Loading 3D viewer...
      </div>
    ),
  }
);

// Exercises that have 3D animations available
const EXERCISES_WITH_3D = ['bridging'];

interface Exercise {
  id: string;
  slug: string;
  name: string;
  description: string;
  equipment: string;
  difficulty: string;
  focusAreas: string[];
  setupSteps: string[];
  executionSteps: string[];
  cues: string[];
  commonMistakes: string[];
  modifications: { easier: string[]; harder: string[] };
  contraindications: string[];
  safetyNotes: string | null;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  defaultReps: number | null;
  defaultDuration: number | null;
  defaultSets: number;
  defaultTempo: string | null;
  rpeTarget: number;
  springSuggestion: string | null;
}

const DIFFICULTY_LABELS: Record<string, { label: string; color: string }> = {
  beginner: { label: 'Beginner', color: 'rgba(150, 255, 150, 0.3)' },
  intermediate: { label: 'Intermediate', color: 'rgba(255, 200, 100, 0.3)' },
  advanced: { label: 'Advanced', color: 'rgba(255, 100, 150, 0.3)' },
};

export default function ExerciseDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchExercise() {
      try {
        const response = await fetch(`/api/learn/exercises/${slug}`);
        if (response.ok) {
          const data = await response.json();
          setExercise(data.exercise);
        }
      } catch (error) {
        console.error('Error loading exercise:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchExercise();
  }, [slug]);

  if (loading) {
    return (
      <div className="container" style={{ paddingTop: '3rem', paddingBottom: '3rem' }}>
        <div style={{ maxWidth: '42rem', margin: '0 auto' }}>
          <div style={{ animation: 'pulse 2s infinite' }}>Loading exercise...</div>
        </div>
      </div>
    );
  }

  if (!exercise) {
    return (
      <div className="container" style={{ paddingTop: '3rem', paddingBottom: '3rem' }}>
        <div style={{ maxWidth: '42rem', margin: '0 auto', textAlign: 'center' }}>
          <h1 style={{ marginBottom: '1rem' }}>Exercise Not Found</h1>
          <p style={{ color: 'rgba(246, 237, 221, 0.6)', marginBottom: '2rem' }}>
            This exercise may not exist or has been removed.
          </p>
          <Link href="/learn/exercises" className="btn btn-primary">
            Browse Exercises
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '3rem' }}>
      <div style={{ maxWidth: '42rem', margin: '0 auto' }}>
        {/* Back Link */}
        <Link
          href="/learn/exercises"
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
          All Exercises
        </Link>

        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <span style={{
              padding: '0.25rem 0.5rem',
              borderRadius: '9999px',
              background: DIFFICULTY_LABELS[exercise.difficulty]?.color || 'rgba(246, 237, 221, 0.1)',
              fontSize: '0.75rem'
            }}>
              {DIFFICULTY_LABELS[exercise.difficulty]?.label || exercise.difficulty}
            </span>
            <span style={{
              padding: '0.25rem 0.5rem',
              borderRadius: '9999px',
              background: 'rgba(246, 237, 221, 0.1)',
              fontSize: '0.75rem'
            }}>
              {exercise.equipment}
            </span>
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 500, marginBottom: '0.75rem' }}>
            {exercise.name}
          </h1>
          <p style={{ color: 'rgba(246, 237, 221, 0.7)', lineHeight: 1.6 }}>
            {exercise.description}
          </p>
        </div>

        {/* 3D Animation Viewer (if available) */}
        {EXERCISES_WITH_3D.includes(exercise.slug) && (
          <div className="card" style={{ marginBottom: '1.5rem', padding: 0, overflow: 'hidden' }}>
            <Exercise3DViewer
              exerciseSlug={exercise.slug}
              showReformer={exercise.equipment === 'reformer'}
            />
          </div>
        )}

        {/* Quick Info Card */}
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
            {exercise.defaultReps && (
              <div>
                <div style={{ fontSize: '0.75rem', color: 'rgba(246, 237, 221, 0.6)', marginBottom: '0.25rem' }}>REPS</div>
                <div style={{ fontWeight: 500 }}>{exercise.defaultReps}</div>
              </div>
            )}
            {exercise.defaultDuration && (
              <div>
                <div style={{ fontSize: '0.75rem', color: 'rgba(246, 237, 221, 0.6)', marginBottom: '0.25rem' }}>DURATION</div>
                <div style={{ fontWeight: 500 }}>{exercise.defaultDuration} sec</div>
              </div>
            )}
            <div>
              <div style={{ fontSize: '0.75rem', color: 'rgba(246, 237, 221, 0.6)', marginBottom: '0.25rem' }}>SETS</div>
              <div style={{ fontWeight: 500 }}>{exercise.defaultSets}</div>
            </div>
            {exercise.defaultTempo && (
              <div>
                <div style={{ fontSize: '0.75rem', color: 'rgba(246, 237, 221, 0.6)', marginBottom: '0.25rem' }}>TEMPO</div>
                <div style={{ fontWeight: 500 }}>{exercise.defaultTempo}</div>
              </div>
            )}
            <div>
              <div style={{ fontSize: '0.75rem', color: 'rgba(246, 237, 221, 0.6)', marginBottom: '0.25rem' }}>RPE TARGET</div>
              <div style={{ fontWeight: 500 }}>{exercise.rpeTarget}/10</div>
            </div>
            {exercise.springSuggestion && (
              <div>
                <div style={{ fontSize: '0.75rem', color: 'rgba(246, 237, 221, 0.6)', marginBottom: '0.25rem' }}>SPRINGS</div>
                <div style={{ fontWeight: 500 }}>{exercise.springSuggestion}</div>
              </div>
            )}
          </div>
        </div>

        {/* Setup */}
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 500, marginBottom: '1rem' }}>Setup</h2>
          <ol style={{ margin: 0, paddingLeft: '1.25rem' }}>
            {exercise.setupSteps.map((step, i) => (
              <li key={i} style={{ marginBottom: '0.5rem', lineHeight: 1.5 }}>{step}</li>
            ))}
          </ol>
        </div>

        {/* Execution */}
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 500, marginBottom: '1rem' }}>Execution</h2>
          <ol style={{ margin: 0, paddingLeft: '1.25rem' }}>
            {exercise.executionSteps.map((step, i) => (
              <li key={i} style={{ marginBottom: '0.5rem', lineHeight: 1.5 }}>{step}</li>
            ))}
          </ol>
        </div>

        {/* Key Cues */}
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 500, marginBottom: '1rem' }}>Key Cues</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {exercise.cues.map((cue, i) => (
              <div key={i} style={{
                padding: '0.75rem 1rem',
                background: 'rgba(246, 237, 221, 0.05)',
                borderRadius: '0.5rem',
                lineHeight: 1.5
              }}>
                {cue}
              </div>
            ))}
          </div>
        </div>

        {/* Common Mistakes */}
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 500, marginBottom: '1rem' }}>Common Mistakes to Avoid</h2>
          <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
            {exercise.commonMistakes.map((mistake, i) => (
              <li key={i} style={{ marginBottom: '0.5rem', lineHeight: 1.5, color: 'rgba(255, 150, 150, 0.9)' }}>{mistake}</li>
            ))}
          </ul>
        </div>

        {/* Modifications */}
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 500, marginBottom: '1rem' }}>Modifications</h2>
          <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(2, 1fr)' }}>
            <div>
              <h3 style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem', color: 'rgba(150, 255, 150, 0.8)' }}>Easier</h3>
              <ul style={{ margin: 0, paddingLeft: '1rem', fontSize: '0.875rem' }}>
                {exercise.modifications.easier.map((mod, i) => (
                  <li key={i} style={{ marginBottom: '0.25rem', lineHeight: 1.5 }}>{mod}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem', color: 'rgba(255, 200, 100, 0.8)' }}>Harder</h3>
              <ul style={{ margin: 0, paddingLeft: '1rem', fontSize: '0.875rem' }}>
                {exercise.modifications.harder.map((mod, i) => (
                  <li key={i} style={{ marginBottom: '0.25rem', lineHeight: 1.5 }}>{mod}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Muscles Worked */}
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 500, marginBottom: '1rem' }}>Muscles Worked</h2>
          <div style={{ marginBottom: '0.75rem' }}>
            <div style={{ fontSize: '0.75rem', color: 'rgba(246, 237, 221, 0.6)', marginBottom: '0.5rem' }}>PRIMARY</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {exercise.primaryMuscles.map((muscle, i) => (
                <span key={i} style={{
                  padding: '0.25rem 0.5rem',
                  background: 'rgba(246, 237, 221, 0.15)',
                  borderRadius: '9999px',
                  fontSize: '0.8125rem'
                }}>{muscle.replace('_', ' ')}</span>
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'rgba(246, 237, 221, 0.6)', marginBottom: '0.5rem' }}>SECONDARY</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {exercise.secondaryMuscles.map((muscle, i) => (
                <span key={i} style={{
                  padding: '0.25rem 0.5rem',
                  background: 'rgba(246, 237, 221, 0.05)',
                  borderRadius: '9999px',
                  fontSize: '0.8125rem',
                  color: 'rgba(246, 237, 221, 0.7)'
                }}>{muscle.replace('_', ' ')}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Safety Notes & Contraindications */}
        {(exercise.safetyNotes || exercise.contraindications.length > 0) && (
          <div className="card" style={{
            background: 'rgba(255, 150, 100, 0.1)',
            borderColor: 'rgba(255, 150, 100, 0.3)'
          }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 500, marginBottom: '1rem' }}>Safety Information</h2>
            {exercise.safetyNotes && (
              <p style={{ marginBottom: exercise.contraindications.length > 0 ? '1rem' : 0, lineHeight: 1.6 }}>
                {exercise.safetyNotes}
              </p>
            )}
            {exercise.contraindications.length > 0 && (
              <div>
                <div style={{ fontSize: '0.75rem', color: 'rgba(246, 237, 221, 0.6)', marginBottom: '0.5rem' }}>CONSIDERATIONS</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {exercise.contraindications.map((c, i) => (
                    <span key={i} style={{
                      padding: '0.25rem 0.5rem',
                      background: 'rgba(255, 150, 100, 0.2)',
                      borderRadius: '9999px',
                      fontSize: '0.8125rem'
                    }}>{c.replace('_', ' ')}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
