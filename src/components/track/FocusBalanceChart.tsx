'use client';

interface FocusBalanceChartProps {
  focusAreaCounts: Record<string, number>;
}

const FOCUS_AREAS = [
  { key: 'core', label: 'Core', color: 'rgba(99, 102, 241, 0.8)' },
  { key: 'glutes', label: 'Glutes', color: 'rgba(236, 72, 153, 0.8)' },
  { key: 'legs', label: 'Legs', color: 'rgba(34, 197, 94, 0.8)' },
  { key: 'arms', label: 'Arms', color: 'rgba(249, 115, 22, 0.8)' },
  { key: 'back', label: 'Back', color: 'rgba(59, 130, 246, 0.8)' },
  { key: 'mobility', label: 'Mobility', color: 'rgba(168, 85, 247, 0.8)' },
  { key: 'flexibility', label: 'Flexibility', color: 'rgba(139, 92, 246, 0.8)' },
  { key: 'balance', label: 'Balance', color: 'rgba(20, 184, 166, 0.8)' },
  { key: 'mindfulness', label: 'Mindfulness', color: 'rgba(244, 114, 182, 0.8)' },
  { key: 'cardio', label: 'Cardio', color: 'rgba(239, 68, 68, 0.8)' },
  { key: 'endurance', label: 'Endurance', color: 'rgba(234, 179, 8, 0.8)' },
  { key: 'recovery', label: 'Recovery', color: 'rgba(74, 222, 128, 0.8)' },
  { key: 'upper_body', label: 'Upper Body', color: 'rgba(251, 146, 60, 0.8)' },
  { key: 'lower_body', label: 'Lower Body', color: 'rgba(56, 189, 248, 0.8)' },
  { key: 'full_body', label: 'Full Body', color: 'rgba(192, 132, 252, 0.8)' },
];

export function FocusBalanceChart({ focusAreaCounts }: FocusBalanceChartProps) {
  const totalWorkouts = Object.values(focusAreaCounts).reduce((a, b) => a + b, 0);

  if (totalWorkouts === 0) {
    return (
      <div className="card">
        <h3 style={{ fontSize: '1rem', fontWeight: 500, marginBottom: '1rem' }}>Focus Balance</h3>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <p style={{ color: 'rgba(246, 237, 221, 0.6)', fontSize: '0.875rem' }}>
            Log workouts with focus areas to see your balance
          </p>
        </div>
      </div>
    );
  }

  // Calculate max for scaling
  const maxCount = Math.max(...Object.values(focusAreaCounts), 1);

  // Get counts for each focus area (all areas for bar chart)
  const allAreaData = FOCUS_AREAS.map((area) => ({
    ...area,
    count: focusAreaCounts[area.key] || 0,
    percentage: ((focusAreaCounts[area.key] || 0) / maxCount) * 100
  }));

  // For radar chart, only show areas that have data (minimum 3 for a polygon)
  const areasWithData = allAreaData.filter((a) => a.count > 0);
  const radarData = areasWithData.length >= 3 ? areasWithData : allAreaData.slice(0, Math.max(areasWithData.length, 6));

  // Calculate radar chart points
  const centerX = 100;
  const centerY = 100;
  const maxRadius = 70;
  const angleStep = 360 / radarData.length;

  const getPoint = (index: number, value: number) => {
    const angle = (index * angleStep - 90) * (Math.PI / 180);
    const radius = (value / maxCount) * maxRadius;
    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle)
    };
  };

  const points = radarData.map((area, index) => getPoint(index, area.count));
  const polygonPoints = points.map((p) => `${p.x},${p.y}`).join(' ');

  return (
    <div className="card">
      <h3 style={{ fontSize: '1rem', fontWeight: 500, marginBottom: '1rem' }}>Focus Balance</h3>

      {/* Radar Chart */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
        <svg width="200" height="200" viewBox="0 0 200 200">
          {/* Background circles */}
          {[0.25, 0.5, 0.75, 1].map((scale) => (
            <circle
              key={scale}
              cx={centerX}
              cy={centerY}
              r={maxRadius * scale}
              fill="none"
              stroke="rgba(246, 237, 221, 0.1)"
              strokeWidth="1"
            />
          ))}

          {/* Axis lines */}
          {radarData.map((_, index) => {
            const angle = (index * angleStep - 90) * (Math.PI / 180);
            const endX = centerX + maxRadius * Math.cos(angle);
            const endY = centerY + maxRadius * Math.sin(angle);
            return (
              <line
                key={index}
                x1={centerX}
                y1={centerY}
                x2={endX}
                y2={endY}
                stroke="rgba(246, 237, 221, 0.1)"
                strokeWidth="1"
              />
            );
          })}

          {/* Data polygon */}
          <polygon
            points={polygonPoints}
            fill="rgba(99, 102, 241, 0.3)"
            stroke="rgba(99, 102, 241, 0.8)"
            strokeWidth="2"
          />

          {/* Data points */}
          {points.map((point, index) => (
            <circle
              key={index}
              cx={point.x}
              cy={point.y}
              r="4"
              fill={radarData[index].color}
            />
          ))}

          {/* Labels */}
          {radarData.map((area, index) => {
            const angle = (index * angleStep - 90) * (Math.PI / 180);
            const labelRadius = maxRadius + 18;
            const x = centerX + labelRadius * Math.cos(angle);
            const y = centerY + labelRadius * Math.sin(angle);
            return (
              <text
                key={area.key}
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="rgba(246, 237, 221, 0.7)"
                fontSize="11"
              >
                {area.label}
              </text>
            );
          })}
        </svg>
      </div>

      {/* Bar breakdown */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {allAreaData
          .filter((area) => area.count > 0)
          .sort((a, b) => b.count - a.count)
          .map((area) => (
            <div key={area.key} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: '0.8125rem', width: '80px', color: 'rgba(246, 237, 221, 0.7)' }}>
                {area.label}
              </span>
              <div style={{ flex: 1, height: '8px', background: 'rgba(246, 237, 221, 0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${area.percentage}%`,
                    height: '100%',
                    background: area.color,
                    borderRadius: '4px',
                    transition: 'width 0.3s ease'
                  }}
                />
              </div>
              <span style={{ fontSize: '0.8125rem', width: '24px', textAlign: 'right', fontWeight: 500 }}>
                {area.count}
              </span>
            </div>
          ))}
      </div>
    </div>
  );
}
