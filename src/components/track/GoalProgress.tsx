'use client';

interface GoalProgressProps {
  weeklyWorkoutGoal: number | null | undefined;
  weeklyMinuteGoal: number | null | undefined;
  weeklyWorkouts: number;
  weeklyMinutes: number;
}

function ProgressBar({ current, goal, color }: { current: number; goal: number; color: string }) {
  const pct = Math.min((current / goal) * 100, 100);
  const completed = current >= goal;

  return (
    <div style={{ flex: 1 }}>
      <div style={{
        height: '8px',
        background: 'rgba(246, 237, 221, 0.1)',
        borderRadius: '4px',
        overflow: 'hidden',
      }}>
        <div style={{
          width: `${pct}%`,
          height: '100%',
          background: completed
            ? 'linear-gradient(90deg, rgba(34, 197, 94, 0.8) 0%, rgba(22, 163, 74, 0.8) 100%)'
            : color,
          borderRadius: '4px',
          transition: 'width 0.3s ease',
        }} />
      </div>
    </div>
  );
}

export function GoalProgress({ weeklyWorkoutGoal, weeklyMinuteGoal, weeklyWorkouts, weeklyMinutes }: GoalProgressProps) {
  const hasWorkoutGoal = weeklyWorkoutGoal != null && weeklyWorkoutGoal > 0;
  const hasMinuteGoal = weeklyMinuteGoal != null && weeklyMinuteGoal > 0;

  if (!hasWorkoutGoal && !hasMinuteGoal) return null;

  return (
    <div className="card" style={{ marginBottom: '1.5rem' }}>
      <h3 style={{ fontSize: '1rem', fontWeight: 500, marginBottom: '1rem' }}>Weekly Goals</h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
        {hasWorkoutGoal && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '2rem',
              height: '2rem',
              borderRadius: '0.5rem',
              background: 'rgba(245, 158, 11, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <svg style={{ width: '1rem', height: '1rem' }} fill="none" stroke="#f59e0b" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <ProgressBar
              current={weeklyWorkouts}
              goal={weeklyWorkoutGoal!}
              color="rgba(245, 158, 11, 0.6)"
            />
            <span style={{
              fontSize: '0.8125rem',
              fontWeight: 500,
              whiteSpace: 'nowrap',
              color: weeklyWorkouts >= weeklyWorkoutGoal! ? '#22c55e' : '#f6eddd',
            }}>
              {weeklyWorkouts}/{weeklyWorkoutGoal} workouts
            </span>
          </div>
        )}

        {hasMinuteGoal && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '2rem',
              height: '2rem',
              borderRadius: '0.5rem',
              background: 'rgba(99, 102, 241, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <svg style={{ width: '1rem', height: '1rem' }} fill="none" stroke="#6366f1" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <ProgressBar
              current={weeklyMinutes}
              goal={weeklyMinuteGoal!}
              color="rgba(99, 102, 241, 0.6)"
            />
            <span style={{
              fontSize: '0.8125rem',
              fontWeight: 500,
              whiteSpace: 'nowrap',
              color: weeklyMinutes >= weeklyMinuteGoal! ? '#22c55e' : '#f6eddd',
            }}>
              {weeklyMinutes}/{weeklyMinuteGoal} min
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
