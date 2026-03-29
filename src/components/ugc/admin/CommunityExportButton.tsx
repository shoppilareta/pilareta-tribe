'use client';

export function CommunityExportButton() {
  return (
    <button
      onClick={() => window.open('/api/admin/exports?type=posts', '_blank')}
      style={{
        padding: '0.625rem 1.25rem',
        borderRadius: '8px',
        border: '1px solid rgba(246, 237, 221, 0.15)',
        background: 'rgba(246, 237, 221, 0.08)',
        color: '#f6eddd',
        fontSize: '0.85rem',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        flexShrink: 0,
      }}
    >
      Export CSV
    </button>
  );
}
