'use client';

interface StatsOverviewProps {
  totalWorkouts: number;
  totalMinutes: number;
  weeklyMinutes: number;
  monthlyMinutes: number;
  totalCalories: number;
  averageRpe: number | null;
}

export function StatsOverview({
  totalWorkouts,
  totalMinutes,
  weeklyMinutes,
  monthlyMinutes,
  totalCalories,
  averageRpe
}: StatsOverviewProps) {
  const formatMinutes = (mins: number) => {
    if (mins < 60) return `${mins} min`;
    const hours = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    if (remainingMins === 0) return `${hours}h`;
    return `${hours}h ${remainingMins}m`;
  };

  const stats = [
    {
      label: 'This Week',
      value: formatMinutes(weeklyMinutes),
      icon: (
        <svg style={{ width: '1.25rem', height: '1.25rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      label: 'This Month',
      value: formatMinutes(monthlyMinutes),
      icon: (
        <svg style={{ width: '1.25rem', height: '1.25rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      label: 'Total Workouts',
      value: totalWorkouts.toString(),
      icon: (
        <svg style={{ width: '1.25rem', height: '1.25rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      label: 'Total Time',
      value: formatMinutes(totalMinutes),
      icon: (
        <svg style={{ width: '1.25rem', height: '1.25rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      )
    }
  ];

  return (
    <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))' }}>
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="card"
          style={{ padding: '1rem', textAlign: 'center' }}
        >
          <div style={{
            width: '2.5rem',
            height: '2.5rem',
            borderRadius: '0.75rem',
            background: 'rgba(246, 237, 221, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 0.75rem',
            opacity: 0.8
          }}>
            {stat.icon}
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.25rem' }}>
            {stat.value}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'rgba(246, 237, 221, 0.6)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {stat.label}
          </div>
        </div>
      ))}

      {/* Secondary stats row */}
      <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'center', gap: '2rem', marginTop: '0.5rem' }}>
        <div style={{ textAlign: 'center' }}>
          <span style={{ color: 'rgba(246, 237, 221, 0.5)', fontSize: '0.8125rem' }}>Est. Calories: </span>
          <span style={{ fontWeight: 500 }}>{totalCalories.toLocaleString()}</span>
        </div>
        {averageRpe !== null && (
          <div style={{ textAlign: 'center' }}>
            <span style={{ color: 'rgba(246, 237, 221, 0.5)', fontSize: '0.8125rem' }}>Avg. Intensity: </span>
            <span style={{ fontWeight: 500 }}>{averageRpe}/10</span>
          </div>
        )}
      </div>
    </div>
  );
}
