'use client';

interface ConsentCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

export function ConsentCheckbox({ checked, onChange, disabled }: ConsentCheckboxProps) {
  return (
    <label
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '10px',
        marginTop: '1rem',
        padding: '12px',
        background: 'rgba(246, 237, 221, 0.03)',
        borderRadius: '2px',
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        style={{
          marginTop: '2px',
          accentColor: '#f59e0b',
          cursor: disabled ? 'not-allowed' : 'pointer',
        }}
      />
      <span
        style={{
          fontSize: '0.8rem',
          color: 'rgba(246, 237, 221, 0.8)',
          lineHeight: 1.5,
        }}
      >
        I confirm that I have the right to share this content and agree to the{' '}
        <a
          href="/ugc/guidelines"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: '#f59e0b',
            textDecoration: 'none',
          }}
        >
          Community Guidelines
        </a>
        . I understand that my post will be reviewed before appearing publicly.
      </span>
    </label>
  );
}
