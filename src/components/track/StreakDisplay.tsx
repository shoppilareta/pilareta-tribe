'use client';

interface StreakDisplayProps {
  currentStreak: number;
  longestStreak: number;
  lastWorkoutDate: string | null;
}

export function StreakDisplay({ currentStreak, longestStreak, lastWorkoutDate }: StreakDisplayProps) {
  const isActive = currentStreak > 0;

  // Format last workout date
  const formatLastWorkout = (dateStr: string | null) => {
    if (!dateStr) return 'Never';

    const date = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const logDate = new Date(date);
    logDate.setHours(0, 0, 0, 0);

    if (logDate.getTime() === today.getTime()) return 'Today';
    if (logDate.getTime() === yesterday.getTime()) return 'Yesterday';

    const diffDays = Math.floor((today.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 7) return `${diffDays} days ago`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div
      className="card"
      style={{
        background: isActive
          ? 'linear-gradient(135deg, rgba(249, 115, 22, 0.15) 0%, rgba(239, 68, 68, 0.1) 100%)'
          : undefined,
        borderColor: isActive ? 'rgba(249, 115, 22, 0.3)' : undefined
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
        <div style={{
          fontSize: '2.5rem',
          lineHeight: 1
        }}>
          {isActive ? '🔥' : '❄️'}
        </div>
        <div>
          <div style={{ fontSize: '2rem', fontWeight: 600, lineHeight: 1.2 }}>
            {currentStreak}
          </div>
          <div style={{ fontSize: '0.875rem', color: 'rgba(246, 237, 221, 0.6)' }}>
            day streak
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
        <div>
          <span style={{ color: 'rgba(246, 237, 221, 0.5)' }}>Longest: </span>
          <span style={{ fontWeight: 500 }}>{longestStreak} days</span>
        </div>
        <div>
          <span style={{ color: 'rgba(246, 237, 221, 0.5)' }}>Last: </span>
          <span style={{ fontWeight: 500 }}>{formatLastWorkout(lastWorkoutDate)}</span>
        </div>
      </div>

      {currentStreak > 0 && currentStreak >= longestStreak && (
        <div style={{
          marginTop: '0.75rem',
          padding: '0.5rem',
          background: 'rgba(246, 237, 221, 0.1)',
          borderRadius: '0.5rem',
          textAlign: 'center',
          fontSize: '0.8125rem'
        }}>
          ⭐ Personal best!
        </div>
      )}
    </div>
  );
}
