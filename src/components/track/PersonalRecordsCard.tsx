'use client';

interface PersonalRecords {
  longestSession: number;
  mostActiveWeekWorkouts: number;
  bestStreak: number;
}

interface PersonalRecordsCardProps {
  records: PersonalRecords;
  currentStreak: number;
}

function RecordRow({ icon, label, value, highlight }: { icon: React.ReactNode; label: string; value: string; highlight?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.375rem 0' }}>
      <div
        style={{
          width: '1.75rem',
          height: '1.75rem',
          borderRadius: '50%',
          background: 'rgba(245, 158, 11, 0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <span style={{ flex: 1, fontSize: '0.875rem', color: 'rgba(246, 237, 221, 0.7)' }}>
        {label}
      </span>
      <span style={{
        fontSize: '0.875rem',
        fontWeight: 600,
        color: highlight ? '#f59e0b' : '#f6eddd',
      }}>
        {value}
      </span>
    </div>
  );
}

export function PersonalRecordsCard({ records, currentStreak }: PersonalRecordsCardProps) {
  if (!records) return null;

  const isStreakPR = currentStreak > 0 && currentStreak >= records.bestStreak;

  return (
    <div className="card">
      <h3 style={{ fontSize: '1rem', fontWeight: 500, marginBottom: '1rem' }}>Personal Records</h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        <RecordRow
          icon={
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          }
          label="Longest session"
          value={`${records.longestSession} min`}
        />
        <RecordRow
          icon={
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          }
          label="Most active week"
          value={`${records.mostActiveWeekWorkouts} workouts`}
        />
        <RecordRow
          icon={
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          }
          label={isStreakPR ? 'Current streak (PR!)' : 'Best streak'}
          value={`${isStreakPR ? currentStreak : records.bestStreak} days`}
          highlight={isStreakPR}
        />
      </div>
    </div>
  );
}
