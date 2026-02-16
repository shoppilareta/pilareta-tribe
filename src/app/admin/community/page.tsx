import { AdminUgcTabs } from '@/components/ugc/admin/AdminUgcTabs';

export default async function AdminUgcPage() {
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem' }}>
          <a
            href="/admin"
            style={{
              color: 'rgba(246, 237, 221, 0.5)',
              textDecoration: 'none',
              fontSize: '0.875rem',
            }}
          >
            Admin
          </a>
          <span style={{ color: 'rgba(246, 237, 221, 0.3)' }}>/</span>
          <span style={{ color: 'rgba(246, 237, 221, 0.8)', fontSize: '0.875rem' }}>
            Community
          </span>
        </div>
        <h1
          style={{
            margin: 0,
            fontSize: '1.5rem',
            fontWeight: 400,
            color: '#f6eddd',
            letterSpacing: '-0.02em',
          }}
        >
          Community Content Moderation
        </h1>
        <p
          style={{
            margin: '0.25rem 0 0',
            fontSize: '0.875rem',
            color: 'rgba(246, 237, 221, 0.5)',
          }}
        >
          Review and approve user-submitted content
        </p>
      </div>

      {/* Admin Tabs */}
      <AdminUgcTabs />
    </div>
  );
}
