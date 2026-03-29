'use client';

import { useEffect, useState } from 'react';

interface TimeSeriesPoint {
  date: string;
  count: number;
}

interface TopWorkoutType {
  workoutType: string;
  count: number;
}

interface AnalyticsData {
  signups: TimeSeriesPoint[];
  posts: TimeSeriesPoint[];
  workouts: TimeSeriesPoint[];
  wau: number;
  mau: number;
  totalUsers: number;
  topTypes: TopWorkoutType[];
  growth: {
    thisWeek: number;
    lastWeek: number;
  };
}

const textColor = '#f6eddd';
const mutedColor = 'rgba(246, 237, 221, 0.5)';
const cardBg = 'rgba(246, 237, 221, 0.03)';
const borderColor = 'rgba(246, 237, 221, 0.08)';

function BarChart({ data, label, color }: { data: TimeSeriesPoint[]; label: string; color: string }) {
  if (data.length === 0) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: mutedColor, fontSize: '0.8rem' }}>
        No {label.toLowerCase()} data
      </div>
    );
  }

  const maxCount = Math.max(...data.map((d) => d.count), 1);

  return (
    <div>
      <div
        style={{
          fontSize: '0.8rem',
          fontWeight: 500,
          color: textColor,
          marginBottom: '0.75rem',
        }}
      >
        {label}
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: '2px',
          height: '120px',
          padding: '0 4px',
        }}
      >
        {data.map((point) => {
          const height = Math.max((point.count / maxCount) * 100, 2);
          return (
            <div
              key={point.date}
              title={`${point.date}: ${point.count}`}
              style={{
                flex: 1,
                minWidth: 0,
                height: `${height}%`,
                background: color,
                borderRadius: '2px 2px 0 0',
                transition: 'opacity 0.15s ease',
                cursor: 'default',
                opacity: 0.7,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '1';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '0.7';
              }}
            />
          );
        })}
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '0.6rem',
          color: 'rgba(246, 237, 221, 0.35)',
          marginTop: '4px',
          padding: '0 4px',
        }}
      >
        <span>{data[0]?.date.slice(5) || ''}</span>
        <span>{data[data.length - 1]?.date.slice(5) || ''}</span>
      </div>
    </div>
  );
}

export default function AnalyticsDashboardPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/analytics')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch analytics');
        return res.json();
      })
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ padding: '3rem 0', textAlign: 'center', color: mutedColor }}>
          Loading analytics...
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ padding: '3rem 0', textAlign: 'center', color: '#e57373' }}>
          {error || 'Failed to load analytics'}
        </div>
      </div>
    );
  }

  const growthPercent =
    data.growth.lastWeek > 0
      ? Math.round(((data.growth.thisWeek - data.growth.lastWeek) / data.growth.lastWeek) * 100)
      : data.growth.thisWeek > 0
        ? 100
        : 0;

  const totalSignups30d = data.signups.reduce((sum, d) => sum + d.count, 0);
  const totalPosts30d = data.posts.reduce((sum, d) => sum + d.count, 0);
  const totalWorkouts30d = data.workouts.reduce((sum, d) => sum + d.count, 0);

  const summaryCards = [
    { label: 'Total Users', value: data.totalUsers.toLocaleString() },
    { label: 'WAU', value: data.wau.toLocaleString(), sub: 'Weekly active users' },
    { label: 'MAU', value: data.mau.toLocaleString(), sub: 'Monthly active users' },
    {
      label: 'Growth',
      value: `${growthPercent >= 0 ? '+' : ''}${growthPercent}%`,
      sub: `${data.growth.thisWeek} this week vs ${data.growth.lastWeek} last week`,
      highlight: growthPercent >= 0,
    },
  ];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem' }}>
          <a
            href="/admin"
            style={{ color: mutedColor, textDecoration: 'none', fontSize: '0.875rem' }}
          >
            Admin
          </a>
          <span style={{ color: 'rgba(246, 237, 221, 0.3)' }}>/</span>
          <span style={{ color: 'rgba(246, 237, 221, 0.8)', fontSize: '0.875rem' }}>Analytics</span>
        </div>
        <h1
          style={{
            margin: 0,
            fontSize: '1.5rem',
            fontWeight: 400,
            color: textColor,
            letterSpacing: '-0.02em',
          }}
        >
          Analytics Dashboard
        </h1>
        <p style={{ margin: '0.25rem 0 0', fontSize: '0.875rem', color: mutedColor }}>
          Platform metrics over the last 30 days
        </p>
      </div>

      {/* Summary Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem',
        }}
      >
        {summaryCards.map((card) => (
          <div
            key={card.label}
            style={{
              background: cardBg,
              border: `1px solid ${borderColor}`,
              borderRadius: '12px',
              padding: '1.25rem',
            }}
          >
            <div
              style={{
                fontSize: '0.75rem',
                fontWeight: 500,
                color: mutedColor,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '0.5rem',
              }}
            >
              {card.label}
            </div>
            <div
              style={{
                fontSize: '2rem',
                fontWeight: 300,
                color: 'highlight' in card && card.highlight !== undefined
                  ? card.highlight
                    ? '#81c784'
                    : '#e57373'
                  : textColor,
                letterSpacing: '-0.03em',
                lineHeight: 1.1,
              }}
            >
              {card.value}
            </div>
            {'sub' in card && card.sub && (
              <div style={{ fontSize: '0.75rem', color: 'rgba(246, 237, 221, 0.4)', marginTop: '0.375rem' }}>
                {card.sub}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Charts */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem',
        }}
      >
        {/* Signups Chart */}
        <div
          style={{
            background: cardBg,
            border: `1px solid ${borderColor}`,
            borderRadius: '12px',
            padding: '1.25rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
            <BarChart data={data.signups} label="User Signups" color="rgba(129, 199, 132, 0.7)" />
          </div>
          <div style={{ fontSize: '0.75rem', color: mutedColor, marginTop: '0.5rem' }}>
            {totalSignups30d} signups in last 30 days
          </div>
        </div>

        {/* Posts Chart */}
        <div
          style={{
            background: cardBg,
            border: `1px solid ${borderColor}`,
            borderRadius: '12px',
            padding: '1.25rem',
          }}
        >
          <BarChart data={data.posts} label="Community Posts" color="rgba(100, 181, 246, 0.7)" />
          <div style={{ fontSize: '0.75rem', color: mutedColor, marginTop: '0.5rem' }}>
            {totalPosts30d} posts in last 30 days
          </div>
        </div>

        {/* Workouts Chart */}
        <div
          style={{
            background: cardBg,
            border: `1px solid ${borderColor}`,
            borderRadius: '12px',
            padding: '1.25rem',
          }}
        >
          <BarChart data={data.workouts} label="Workout Logs" color="rgba(255, 183, 77, 0.7)" />
          <div style={{ fontSize: '0.75rem', color: mutedColor, marginTop: '0.5rem' }}>
            {totalWorkouts30d} workouts in last 30 days
          </div>
        </div>
      </div>

      {/* Bottom row: Top Workout Types + Growth Comparison */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1.5rem',
        }}
      >
        {/* Top Workout Types */}
        <div
          style={{
            background: cardBg,
            border: `1px solid ${borderColor}`,
            borderRadius: '12px',
            padding: '1.25rem',
          }}
        >
          <div
            style={{
              fontSize: '0.8rem',
              fontWeight: 500,
              color: textColor,
              marginBottom: '1rem',
            }}
          >
            Top Workout Types
          </div>
          {data.topTypes.length === 0 ? (
            <div style={{ fontSize: '0.8rem', color: mutedColor }}>No workout data</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {(() => {
                const maxTypeCount = Math.max(...data.topTypes.map((t) => t.count), 1);
                return data.topTypes.map((t) => (
                  <div key={t.workoutType}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '0.8rem',
                        marginBottom: '4px',
                      }}
                    >
                      <span style={{ color: textColor, textTransform: 'capitalize' }}>
                        {t.workoutType.replace(/_/g, ' ')}
                      </span>
                      <span style={{ color: mutedColor }}>{t.count}</span>
                    </div>
                    <div
                      style={{
                        height: '6px',
                        borderRadius: '3px',
                        background: 'rgba(246, 237, 221, 0.06)',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          height: '100%',
                          width: `${(t.count / maxTypeCount) * 100}%`,
                          background: 'rgba(255, 183, 77, 0.6)',
                          borderRadius: '3px',
                        }}
                      />
                    </div>
                  </div>
                ));
              })()}
            </div>
          )}
        </div>

        {/* Growth Comparison */}
        <div
          style={{
            background: cardBg,
            border: `1px solid ${borderColor}`,
            borderRadius: '12px',
            padding: '1.25rem',
          }}
        >
          <div
            style={{
              fontSize: '0.8rem',
              fontWeight: 500,
              color: textColor,
              marginBottom: '1rem',
            }}
          >
            Week-over-Week Growth
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: mutedColor, marginBottom: '4px' }}>
                New users this week
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 300, color: textColor }}>
                {data.growth.thisWeek}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: mutedColor, marginBottom: '4px' }}>
                New users last week
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 300, color: textColor }}>
                {data.growth.lastWeek}
              </div>
            </div>
            <div
              style={{
                padding: '0.75rem',
                borderRadius: '8px',
                background: growthPercent >= 0 ? 'rgba(129, 199, 132, 0.08)' : 'rgba(229, 115, 115, 0.08)',
                border: `1px solid ${growthPercent >= 0 ? 'rgba(129, 199, 132, 0.2)' : 'rgba(229, 115, 115, 0.2)'}`,
              }}
            >
              <span
                style={{
                  fontSize: '0.9rem',
                  fontWeight: 500,
                  color: growthPercent >= 0 ? '#81c784' : '#e57373',
                }}
              >
                {growthPercent >= 0 ? '\u2191' : '\u2193'} {Math.abs(growthPercent)}% {growthPercent >= 0 ? 'more' : 'fewer'} users this week
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
