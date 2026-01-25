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
  { key: 'mobility', label: 'Mobility', color: 'rgba(168, 85, 247, 0.8)' }
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

  // Get counts for each focus area
  const areaData = FOCUS_AREAS.map((area) => ({
    ...area,
    count: focusAreaCounts[area.key] || 0,
    percentage: ((focusAreaCounts[area.key] || 0) / maxCount) * 100
  }));

  // Calculate radar chart points
  const centerX = 100;
  const centerY = 100;
  const maxRadius = 70;

  const getPoint = (index: number, value: number) => {
    const angle = (index * 60 - 90) * (Math.PI / 180);
    const radius = (value / maxCount) * maxRadius;
    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle)
    };
  };

  const points = areaData.map((area, index) => getPoint(index, area.count));
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
          {areaData.map((_, index) => {
            const angle = (index * 60 - 90) * (Math.PI / 180);
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
              fill={areaData[index].color}
            />
          ))}

          {/* Labels */}
          {areaData.map((area, index) => {
            const angle = (index * 60 - 90) * (Math.PI / 180);
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
        {areaData
          .filter((area) => area.count > 0)
          .sort((a, b) => b.count - a.count)
          .map((area) => (
            <div key={area.key} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: '0.8125rem', width: '60px', color: 'rgba(246, 237, 221, 0.7)' }}>
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
