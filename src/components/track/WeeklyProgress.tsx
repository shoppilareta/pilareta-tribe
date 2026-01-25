'use client';

interface WeeklyProgressProps {
  progress: boolean[];
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function WeeklyProgress({ progress }: WeeklyProgressProps) {
  // Get today's index (0 = Monday, 6 = Sunday)
  const today = new Date();
  const dayOfWeek = today.getDay();
  const todayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

  const workoutsThisWeek = progress.filter(Boolean).length;

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 500 }}>This Week</h3>
        <span style={{ fontSize: '0.875rem', color: 'rgba(246, 237, 221, 0.6)' }}>
          {workoutsThisWeek}/7 days
        </span>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem' }}>
        {DAYS.map((day, index) => {
          const hasWorkout = progress[index];
          const isToday = index === todayIndex;
          const isFuture = index > todayIndex;

          return (
            <div key={day} style={{ flex: 1, textAlign: 'center' }}>
              <div
                style={{
                  width: '2.5rem',
                  height: '2.5rem',
                  borderRadius: '50%',
                  margin: '0 auto 0.375rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: hasWorkout
                    ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.8) 0%, rgba(22, 163, 74, 0.8) 100%)'
                    : isFuture
                    ? 'rgba(246, 237, 221, 0.05)'
                    : 'rgba(246, 237, 221, 0.1)',
                  border: isToday ? '2px solid rgba(246, 237, 221, 0.5)' : 'none',
                  transition: 'all 0.2s ease'
                }}
              >
                {hasWorkout && (
                  <svg style={{ width: '1rem', height: '1rem', color: '#fff' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <div style={{
                fontSize: '0.6875rem',
                color: isToday ? '#f6eddd' : 'rgba(246, 237, 221, 0.5)',
                fontWeight: isToday ? 500 : 400
              }}>
                {day}
              </div>
            </div>
          );
        })}
      </div>

      {/* Progress bar */}
      <div style={{ marginTop: '1rem' }}>
        <div style={{
          height: '4px',
          background: 'rgba(246, 237, 221, 0.1)',
          borderRadius: '2px',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${(workoutsThisWeek / 7) * 100}%`,
            height: '100%',
            background: 'linear-gradient(90deg, rgba(34, 197, 94, 0.8) 0%, rgba(22, 163, 74, 0.8) 100%)',
            borderRadius: '2px',
            transition: 'width 0.3s ease'
          }} />
        </div>
      </div>
    </div>
  );
}
