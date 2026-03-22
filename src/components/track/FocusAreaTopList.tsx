'use client';

interface FocusAreaTopListProps {
  focusAreaCounts: Record<string, number>;
}

const AREA_LABELS: Record<string, string> = {
  core: 'Core',
  glutes: 'Glutes',
  legs: 'Legs',
  arms: 'Arms',
  back: 'Back',
  mobility: 'Mobility',
  flexibility: 'Flexibility',
  balance: 'Balance',
  mindfulness: 'Mindfulness',
  cardio: 'Cardio',
  endurance: 'Endurance',
  recovery: 'Recovery',
  upper_body: 'Upper Body',
  lower_body: 'Lower Body',
  full_body: 'Full Body',
  posture: 'Posture',
};

const BAR_COLORS = [
  'rgba(34, 197, 94, 0.8)',
  'rgba(59, 130, 246, 0.8)',
  'rgba(245, 158, 11, 0.8)',
  'rgba(168, 85, 247, 0.8)',
  'rgba(236, 72, 153, 0.8)',
];

export function FocusAreaTopList({ focusAreaCounts }: FocusAreaTopListProps) {
  const entries = Object.entries(focusAreaCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  if (entries.length === 0) return null;

  const total = entries.reduce((sum, [, count]) => sum + count, 0);

  return (
    <div className="card">
      <h3 style={{ fontSize: '1rem', fontWeight: 500, marginBottom: '1rem' }}>Top Focus Areas</h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
        {entries.map(([area, count], index) => {
          const pct = total > 0 ? Math.round((count / total) * 100) : 0;
          const label = AREA_LABELS[area] || area.charAt(0).toUpperCase() + area.slice(1).replace('_', ' ');
          const barColor = BAR_COLORS[index % BAR_COLORS.length];

          return (
            <div key={area} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: '0.8125rem', width: '80px', color: 'rgba(246, 237, 221, 0.7)' }}>
                {label}
              </span>
              <div style={{ flex: 1, height: '8px', background: 'rgba(246, 237, 221, 0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${pct}%`,
                    height: '100%',
                    background: barColor,
                    borderRadius: '4px',
                    transition: 'width 0.3s ease',
                  }}
                />
              </div>
              <span style={{ fontSize: '0.8125rem', width: '36px', textAlign: 'right', fontWeight: 500 }}>
                {pct}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
