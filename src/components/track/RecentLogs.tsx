'use client';

import { useState, useEffect } from 'react';
import { ShareModal } from './ShareModal';

interface WorkoutLog {
  id: string;
  workoutDate: string;
  durationMinutes: number;
  workoutType: string;
  rpe: number;
  notes: string | null;
  calorieEstimate: number | null;
  focusAreas: string[];
  isShared: boolean;
  imageUrl?: string | null;
  session?: {
    id: string;
    name: string;
  } | null;
  studio?: {
    id: string;
    name: string;
    city: string;
  } | null;
}

interface RecentLogsProps {
  refreshKey: number;
  onLogWorkout: () => void;
}

export function RecentLogs({ refreshKey, onLogWorkout }: RecentLogsProps) {
  const [logs, setLogs] = useState<WorkoutLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [shareLog, setShareLog] = useState<WorkoutLog | null>(null);
  const [currentStreak, setCurrentStreak] = useState(0);

  useEffect(() => {
    async function fetchData() {
      try {
        const [logsResponse, statsResponse] = await Promise.all([
          fetch('/api/track/logs?limit=5'),
          fetch('/api/track/stats')
        ]);

        if (logsResponse.ok) {
          const data = await logsResponse.json();
          setLogs(data.logs);
        }

        if (statsResponse.ok) {
          const data = await statsResponse.json();
          setCurrentStreak(data.stats?.currentStreak || 0);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [refreshKey]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const logDate = new Date(date);
    logDate.setHours(0, 0, 0, 0);

    if (logDate.getTime() === today.getTime()) return 'Today';
    if (logDate.getTime() === yesterday.getTime()) return 'Yesterday';

    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const getTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      reformer: 'Reformer',
      mat: 'Mat',
      tower: 'Tower',
      other: 'Other'
    };
    return types[type] || type;
  };

  const getRpeColor = (rpe: number) => {
    if (rpe <= 3) return 'rgba(34, 197, 94, 0.8)';
    if (rpe <= 5) return 'rgba(234, 179, 8, 0.8)';
    if (rpe <= 7) return 'rgba(249, 115, 22, 0.8)';
    return 'rgba(239, 68, 68, 0.8)';
  };

  if (loading) {
    return (
      <div className="card">
        <h3 style={{ fontSize: '1rem', fontWeight: 500, marginBottom: '1rem' }}>Recent Workouts</h3>
        <div style={{ textAlign: 'center', padding: '2rem', opacity: 0.6 }}>Loading...</div>
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="card">
        <h3 style={{ fontSize: '1rem', fontWeight: 500, marginBottom: '1rem' }}>Recent Workouts</h3>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <p style={{ color: 'rgba(246, 237, 221, 0.6)', marginBottom: '1rem' }}>
            No workouts logged yet
          </p>
          <button onClick={onLogWorkout} className="btn btn-outline" style={{ fontSize: '0.875rem' }}>
            Log Your First Workout
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <h3 style={{ fontSize: '1rem', fontWeight: 500, marginBottom: '1rem' }}>Recent Workouts</h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {logs.map((log) => (
          <div
            key={log.id}
            style={{
              padding: '0.75rem',
              background: 'rgba(246, 237, 221, 0.05)',
              borderRadius: '0.75rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '0.75rem'
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <span style={{ fontWeight: 500, fontSize: '0.9375rem' }}>
                  {log.durationMinutes} min {getTypeLabel(log.workoutType)}
                </span>
                {log.isShared && (
                  <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>📤</span>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.8125rem', color: 'rgba(246, 237, 221, 0.6)' }}>
                <span>{formatDate(log.workoutDate)}</span>
                {log.studio && (
                  <>
                    <span>•</span>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {log.studio.name}
                    </span>
                  </>
                )}
                {log.session && (
                  <>
                    <span>•</span>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {log.session.name}
                    </span>
                  </>
                )}
              </div>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}>
              {!log.isShared && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShareLog(log);
                  }}
                  title="Share to Community"
                  style={{
                    background: 'rgba(246, 237, 221, 0.1)',
                    border: 'none',
                    borderRadius: '0.375rem',
                    padding: '0.375rem',
                    cursor: 'pointer',
                    color: 'rgba(246, 237, 221, 0.6)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <svg style={{ width: '1rem', height: '1rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                </button>
              )}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
                gap: '0.25rem'
              }}>
                <div style={{
                  width: '2rem',
                  height: '2rem',
                  borderRadius: '50%',
                  background: getRpeColor(log.rpe),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: '#fff'
                }}>
                  {log.rpe}
                </div>
                {log.calorieEstimate && (
                  <span style={{ fontSize: '0.6875rem', color: 'rgba(246, 237, 221, 0.5)' }}>
                    ~{log.calorieEstimate} cal
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {logs.length >= 5 && (
        <button
          className="btn btn-outline"
          style={{
            width: '100%',
            marginTop: '1rem',
            fontSize: '0.875rem'
          }}
          onClick={() => {/* TODO: View all logs */}}
        >
          View All Workouts
        </button>
      )}

      {shareLog && (
        <ShareModal
          log={shareLog}
          currentStreak={currentStreak}
          onClose={() => setShareLog(null)}
          onShared={() => {
            setShareLog(null);
            // Refresh logs to show shared status
            window.location.reload();
          }}
        />
      )}
    </div>
  );
}
