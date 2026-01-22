'use client';

interface ViewToggleProps {
  view: 'map' | 'list';
  onViewChange: (view: 'map' | 'list') => void;
}

export function ViewToggle({ view, onViewChange }: ViewToggleProps) {
  return (
    <div style={{
      display: 'flex',
      gap: '0.5rem',
      background: 'rgba(246, 237, 221, 0.05)',
      borderRadius: '0.5rem',
      padding: '0.25rem',
    }}>
      <button
        type="button"
        onClick={() => onViewChange('map')}
        style={{
          padding: '0.5rem 1rem',
          borderRadius: '0.375rem',
          border: 'none',
          background: view === 'map' ? 'rgba(246, 237, 221, 0.15)' : 'transparent',
          color: view === 'map' ? '#f6eddd' : 'rgba(246, 237, 221, 0.6)',
          cursor: 'pointer',
          fontSize: '0.875rem',
          fontWeight: 500,
          display: 'flex',
          alignItems: 'center',
          gap: '0.375rem',
          transition: 'all 0.15s ease',
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M1 6v16l7-4 8 4 7-4V2l-7 4-8-4-7 4z" />
          <path d="M8 2v16" />
          <path d="M16 6v16" />
        </svg>
        Map
      </button>
      <button
        type="button"
        onClick={() => onViewChange('list')}
        style={{
          padding: '0.5rem 1rem',
          borderRadius: '0.375rem',
          border: 'none',
          background: view === 'list' ? 'rgba(246, 237, 221, 0.15)' : 'transparent',
          color: view === 'list' ? '#f6eddd' : 'rgba(246, 237, 221, 0.6)',
          cursor: 'pointer',
          fontSize: '0.875rem',
          fontWeight: 500,
          display: 'flex',
          alignItems: 'center',
          gap: '0.375rem',
          transition: 'all 0.15s ease',
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="8" y1="6" x2="21" y2="6" />
          <line x1="8" y1="12" x2="21" y2="12" />
          <line x1="8" y1="18" x2="21" y2="18" />
          <line x1="3" y1="6" x2="3.01" y2="6" />
          <line x1="3" y1="12" x2="3.01" y2="12" />
          <line x1="3" y1="18" x2="3.01" y2="18" />
        </svg>
        List
      </button>
    </div>
  );
}
