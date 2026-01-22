'use client';

interface SaveButtonProps {
  isSaved: boolean;
  count: number;
  onClick: () => void;
}

export function SaveButton({ isSaved, count, onClick }: SaveButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        background: 'none',
        border: 'none',
        color: isSaved ? '#f59e0b' : 'rgba(246, 237, 221, 0.8)',
        cursor: 'pointer',
        padding: '4px',
      }}
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill={isSaved ? '#f59e0b' : 'none'}
        stroke={isSaved ? '#f59e0b' : 'currentColor'}
        strokeWidth="2"
      >
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
      </svg>
      <span style={{ fontSize: '0.875rem' }}>{count}</span>
    </button>
  );
}
