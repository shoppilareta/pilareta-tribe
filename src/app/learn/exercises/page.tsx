'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';

interface Exercise {
  id: string;
  slug: string;
  name: string;
  description: string;
  equipment: string;
  difficulty: string;
  focusAreas: string[];
  primaryMuscles: string[];
  rpeTarget: number;
  defaultReps: number | null;
  defaultDuration: number | null;
}

const DIFFICULTY_LABELS: Record<string, { label: string; color: string }> = {
  beginner: { label: 'Beginner', color: 'rgba(150, 255, 150, 0.3)' },
  intermediate: { label: 'Intermediate', color: 'rgba(255, 200, 100, 0.3)' },
  advanced: { label: 'Advanced', color: 'rgba(255, 100, 150, 0.3)' },
};

const FOCUS_AREAS = [
  { value: 'core', label: 'Core' },
  { value: 'glutes', label: 'Glutes' },
  { value: 'legs', label: 'Legs' },
  { value: 'arms', label: 'Arms' },
  { value: 'back', label: 'Back' },
  { value: 'posture', label: 'Posture' },
  { value: 'mobility', label: 'Mobility' },
];

export default function ExercisesPage() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('');
  const [focusFilter, setFocusFilter] = useState<string>('');

  useEffect(() => {
    async function fetchExercises() {
      try {
        const response = await fetch('/api/learn/exercises');
        if (response.ok) {
          const data = await response.json();
          setExercises(data.exercises);
        }
      } catch (error) {
        console.error('Error loading exercises:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchExercises();
  }, []);

  const filteredExercises = useMemo(() => {
    return exercises.filter(exercise => {
      // Search filter
      if (search && !exercise.name.toLowerCase().includes(search.toLowerCase()) &&
          !exercise.description.toLowerCase().includes(search.toLowerCase())) {
        return false;
      }

      // Difficulty filter
      if (difficultyFilter && exercise.difficulty !== difficultyFilter) {
        return false;
      }

      // Focus area filter
      if (focusFilter && !exercise.focusAreas.includes(focusFilter)) {
        return false;
      }

      return true;
    });
  }, [exercises, search, difficultyFilter, focusFilter]);

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
          <h1 style={{ marginBottom: '0.5rem' }}>Exercise Library</h1>
          <p style={{ color: 'rgba(246, 237, 221, 0.6)', lineHeight: 1.6 }}>
            Explore our comprehensive collection of reformer Pilates exercises.
          </p>
        </div>

        {/* Filters */}
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Search */}
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Search exercises..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem 0.75rem 2.5rem',
                  background: 'rgba(246, 237, 221, 0.05)',
                  border: '1px solid rgba(246, 237, 221, 0.1)',
                  borderRadius: '0.5rem',
                  color: 'inherit',
                  fontSize: '0.9375rem'
                }}
              />
              <svg
                style={{
                  position: 'absolute',
                  left: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '1.25rem',
                  height: '1.25rem',
                  opacity: 0.5
                }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* Filter Buttons */}
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              {/* Difficulty Filter */}
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button
                  onClick={() => setDifficultyFilter('')}
                  style={{
                    padding: '0.5rem 0.75rem',
                    borderRadius: '9999px',
                    border: `1px solid ${!difficultyFilter ? 'rgba(246, 237, 221, 0.5)' : 'rgba(246, 237, 221, 0.1)'}`,
                    background: !difficultyFilter ? 'rgba(246, 237, 221, 0.1)' : 'transparent',
                    color: 'inherit',
                    fontSize: '0.8125rem',
                    cursor: 'pointer'
                  }}
                >
                  All Levels
                </button>
                {Object.entries(DIFFICULTY_LABELS).map(([key, { label }]) => (
                  <button
                    key={key}
                    onClick={() => setDifficultyFilter(key)}
                    style={{
                      padding: '0.5rem 0.75rem',
                      borderRadius: '9999px',
                      border: `1px solid ${difficultyFilter === key ? 'rgba(246, 237, 221, 0.5)' : 'rgba(246, 237, 221, 0.1)'}`,
                      background: difficultyFilter === key ? 'rgba(246, 237, 221, 0.1)' : 'transparent',
                      color: 'inherit',
                      fontSize: '0.8125rem',
                      cursor: 'pointer'
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Focus Area Pills */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => setFocusFilter('')}
                style={{
                  padding: '0.5rem 0.75rem',
                  borderRadius: '9999px',
                  border: `1px solid ${!focusFilter ? 'rgba(246, 237, 221, 0.5)' : 'rgba(246, 237, 221, 0.1)'}`,
                  background: !focusFilter ? 'rgba(246, 237, 221, 0.1)' : 'transparent',
                  color: 'inherit',
                  fontSize: '0.8125rem',
                  cursor: 'pointer'
                }}
              >
                All Areas
              </button>
              {FOCUS_AREAS.map((area) => (
                <button
                  key={area.value}
                  onClick={() => setFocusFilter(area.value)}
                  style={{
                    padding: '0.5rem 0.75rem',
                    borderRadius: '9999px',
                    border: `1px solid ${focusFilter === area.value ? 'rgba(246, 237, 221, 0.5)' : 'rgba(246, 237, 221, 0.1)'}`,
                    background: focusFilter === area.value ? 'rgba(246, 237, 221, 0.1)' : 'transparent',
                    color: 'inherit',
                    fontSize: '0.8125rem',
                    cursor: 'pointer'
                  }}
                >
                  {area.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div style={{ marginBottom: '1rem', fontSize: '0.875rem', color: 'rgba(246, 237, 221, 0.6)' }}>
          {loading ? 'Loading...' : `${filteredExercises.length} exercises found`}
        </div>

        {/* Exercise Grid */}
        {loading ? (
          <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="card" style={{ opacity: 0.5, animation: 'pulse 2s infinite' }}>
                <div style={{ height: '1.25rem', background: 'rgba(246, 237, 221, 0.1)', borderRadius: '0.25rem', marginBottom: '0.75rem', width: '60%' }} />
                <div style={{ height: '0.875rem', background: 'rgba(246, 237, 221, 0.1)', borderRadius: '0.25rem', marginBottom: '0.5rem', width: '100%' }} />
                <div style={{ height: '0.875rem', background: 'rgba(246, 237, 221, 0.1)', borderRadius: '0.25rem', width: '80%' }} />
              </div>
            ))}
          </div>
        ) : filteredExercises.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'rgba(246, 237, 221, 0.6)' }}>
            <p>No exercises found matching your criteria.</p>
            <button
              onClick={() => { setSearch(''); setDifficultyFilter(''); setFocusFilter(''); }}
              style={{
                marginTop: '1rem',
                padding: '0.5rem 1rem',
                background: 'rgba(246, 237, 221, 0.1)',
                border: 'none',
                borderRadius: '9999px',
                color: 'inherit',
                cursor: 'pointer'
              }}
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
            {filteredExercises.map((exercise) => (
              <Link
                key={exercise.id}
                href={`/learn/exercises/${exercise.slug}`}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
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
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.borderColor = 'rgba(246, 237, 221, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.borderColor = 'rgba(246, 237, 221, 0.1)';
                  }}
                >
                  {/* Difficulty Badge */}
                  <div style={{
                    display: 'inline-block',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '9999px',
                    background: DIFFICULTY_LABELS[exercise.difficulty]?.color || 'rgba(246, 237, 221, 0.1)',
                    fontSize: '0.6875rem',
                    marginBottom: '0.75rem'
                  }}>
                    {DIFFICULTY_LABELS[exercise.difficulty]?.label || exercise.difficulty}
                  </div>

                  {/* Exercise Name */}
                  <h3 style={{ fontSize: '1.0625rem', fontWeight: 500, marginBottom: '0.5rem' }}>
                    {exercise.name}
                  </h3>

                  {/* Description (truncated) */}
                  <p style={{
                    fontSize: '0.8125rem',
                    color: 'rgba(246, 237, 221, 0.6)',
                    lineHeight: 1.5,
                    marginBottom: '0.75rem',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {exercise.description}
                  </p>

                  {/* Focus Areas */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                    {exercise.focusAreas.slice(0, 3).map((area, i) => (
                      <span
                        key={i}
                        style={{
                          padding: '0.125rem 0.375rem',
                          background: 'rgba(246, 237, 221, 0.05)',
                          borderRadius: '9999px',
                          fontSize: '0.6875rem',
                          color: 'rgba(246, 237, 221, 0.5)'
                        }}
                      >
                        {area}
                      </span>
                    ))}
                    {exercise.rpeTarget && (
                      <span style={{
                        padding: '0.125rem 0.375rem',
                        background: 'rgba(246, 237, 221, 0.05)',
                        borderRadius: '9999px',
                        fontSize: '0.6875rem',
                        color: 'rgba(246, 237, 221, 0.5)'
                      }}>
                        RPE {exercise.rpeTarget}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
