'use client';

import { useEffect, useState } from 'react';

interface Stats {
  counts: {
    totalUsers: number;
    totalPosts: number;
    totalStudios: number;
    activeBanners: number;
    pendingPosts: number;
    totalWorkoutLogs: number;
    pendingClaims: number;
    pendingEditSuggestions: number;
    signupsLast30Days: number;
  };
  recentSignups: Array<{
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    createdAt: string;
  }>;
  recentPosts: Array<{
    id: string;
    caption: string | null;
    mediaType: string;
    status: string;
    createdAt: string;
    user: { id: string; email: string; firstName: string | null; lastName: string | null };
  }>;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/stats')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch stats');
        return res.json();
      })
      .then(setStats)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ padding: '3rem 0', textAlign: 'center', color: 'rgba(246, 237, 221, 0.5)' }}>
          Loading dashboard...
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ padding: '3rem 0', textAlign: 'center', color: '#e57373' }}>
          {error || 'Failed to load dashboard'}
        </div>
      </div>
    );
  }

  const metricCards = [
    { label: 'Total Users', value: stats.counts.totalUsers, sub: `${stats.counts.signupsLast30Days} in last 30d`, href: '/admin/users' },
    { label: 'Total Posts', value: stats.counts.totalPosts, sub: `${stats.counts.pendingPosts} pending`, href: '/admin/community' },
    { label: 'Studios', value: stats.counts.totalStudios, sub: `${stats.counts.pendingClaims} claims pending`, href: '/admin/studios' },
    { label: 'Active Banners', value: stats.counts.activeBanners, sub: 'Shop banners', href: '/admin/shop' },
    { label: 'Workout Logs', value: stats.counts.totalWorkoutLogs, sub: 'All time' },
    { label: 'Pending Reviews', value: stats.counts.pendingPosts + stats.counts.pendingClaims + stats.counts.pendingEditSuggestions, sub: 'Posts + claims + edits', href: '/admin/community' },
  ];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1
          style={{
            margin: 0,
            fontSize: '1.5rem',
            fontWeight: 400,
            color: '#f6eddd',
            letterSpacing: '-0.02em',
          }}
        >
          Dashboard
        </h1>
        <p
          style={{
            margin: '0.25rem 0 0',
            fontSize: '0.875rem',
            color: 'rgba(246, 237, 221, 0.5)',
          }}
        >
          Overview of your platform
        </p>
      </div>

      {/* Metric Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem',
        }}
      >
        {metricCards.map((card) => {
          const inner = (
            <div
              key={card.label}
              style={{
                background: 'rgba(246, 237, 221, 0.03)',
                border: '1px solid rgba(246, 237, 221, 0.08)',
                borderRadius: '12px',
                padding: '1.25rem',
                transition: 'border-color 0.15s ease',
                cursor: card.href ? 'pointer' : 'default',
              }}
              onMouseEnter={(e) => {
                if (card.href) e.currentTarget.style.borderColor = 'rgba(246, 237, 221, 0.2)';
              }}
              onMouseLeave={(e) => {
                if (card.href) e.currentTarget.style.borderColor = 'rgba(246, 237, 221, 0.08)';
              }}
            >
              <div
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  color: 'rgba(246, 237, 221, 0.5)',
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
                  color: '#f6eddd',
                  letterSpacing: '-0.03em',
                  lineHeight: 1.1,
                }}
              >
                {card.value.toLocaleString()}
              </div>
              <div
                style={{
                  fontSize: '0.75rem',
                  color: 'rgba(246, 237, 221, 0.4)',
                  marginTop: '0.375rem',
                }}
              >
                {card.sub}
              </div>
            </div>
          );

          if (card.href) {
            return (
              <a key={card.label} href={card.href} style={{ textDecoration: 'none' }}>
                {inner}
              </a>
            );
          }
          return <div key={card.label}>{inner}</div>;
        })}
      </div>

      {/* Activity Feeds */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '1.5rem',
        }}
      >
        {/* Recent Signups */}
        <div
          style={{
            background: 'rgba(246, 237, 221, 0.03)',
            border: '1px solid rgba(246, 237, 221, 0.08)',
            borderRadius: '12px',
            padding: '1.25rem',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1rem',
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize: '0.9rem',
                fontWeight: 500,
                color: '#f6eddd',
              }}
            >
              Recent Signups
            </h2>
            <a
              href="/admin/users"
              style={{
                fontSize: '0.75rem',
                color: 'rgba(246, 237, 221, 0.4)',
                textDecoration: 'none',
              }}
            >
              View all
            </a>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {stats.recentSignups.length === 0 ? (
              <div style={{ fontSize: '0.85rem', color: 'rgba(246, 237, 221, 0.4)', padding: '1rem 0' }}>
                No recent signups
              </div>
            ) : (
              stats.recentSignups.map((u) => (
                <div
                  key={u.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.5rem 0',
                    borderBottom: '1px solid rgba(246, 237, 221, 0.04)',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.85rem', color: '#f6eddd' }}>
                      {u.firstName || u.lastName
                        ? `${u.firstName || ''} ${u.lastName || ''}`.trim()
                        : u.email}
                    </div>
                    {(u.firstName || u.lastName) && (
                      <div style={{ fontSize: '0.75rem', color: 'rgba(246, 237, 221, 0.4)' }}>
                        {u.email}
                      </div>
                    )}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'rgba(246, 237, 221, 0.35)', whiteSpace: 'nowrap' }}>
                    {formatRelativeTime(u.createdAt)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Posts */}
        <div
          style={{
            background: 'rgba(246, 237, 221, 0.03)',
            border: '1px solid rgba(246, 237, 221, 0.08)',
            borderRadius: '12px',
            padding: '1.25rem',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1rem',
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize: '0.9rem',
                fontWeight: 500,
                color: '#f6eddd',
              }}
            >
              Recent Posts
            </h2>
            <a
              href="/admin/ugc"
              style={{
                fontSize: '0.75rem',
                color: 'rgba(246, 237, 221, 0.4)',
                textDecoration: 'none',
              }}
            >
              View all
            </a>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {stats.recentPosts.length === 0 ? (
              <div style={{ fontSize: '0.85rem', color: 'rgba(246, 237, 221, 0.4)', padding: '1rem 0' }}>
                No recent posts
              </div>
            ) : (
              stats.recentPosts.map((p) => (
                <div
                  key={p.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.5rem 0',
                    borderBottom: '1px solid rgba(246, 237, 221, 0.04)',
                  }}
                >
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: '0.85rem', color: '#f6eddd', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {p.caption || `${p.mediaType} post`}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'rgba(246, 237, 221, 0.4)' }}>
                      by {p.user.firstName || p.user.email}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0, marginLeft: '0.75rem' }}>
                    <span
                      style={{
                        fontSize: '0.65rem',
                        fontWeight: 500,
                        padding: '2px 8px',
                        borderRadius: '10px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.03em',
                        ...(p.status === 'approved'
                          ? { background: 'rgba(76, 175, 80, 0.15)', color: '#81c784' }
                          : p.status === 'rejected'
                            ? { background: 'rgba(229, 115, 115, 0.15)', color: '#e57373' }
                            : { background: 'rgba(255, 183, 77, 0.15)', color: '#ffb74d' }),
                      }}
                    >
                      {p.status}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: 'rgba(246, 237, 221, 0.35)', whiteSpace: 'nowrap' }}>
                      {formatRelativeTime(p.createdAt)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function formatRelativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  return new Date(dateStr).toLocaleDateString();
}
