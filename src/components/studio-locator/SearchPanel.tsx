'use client';

import { useState, FormEvent } from 'react';
import { NearMeButton } from './NearMeButton';

interface SearchPanelProps {
  onSearch: (query: string) => void;
  onNearMe: () => void;
  loading: boolean;
  locationLoading: boolean;
}

export function SearchPanel({ onSearch, onNearMe, loading, locationLoading }: SearchPanelProps) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  return (
    <div
      style={{
        padding: '1rem',
        background: 'rgba(246, 237, 221, 0.03)',
        borderBottom: '1px solid rgba(246, 237, 221, 0.1)',
      }}
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 200px', position: 'relative' }}>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="City or address..."
            disabled={loading || locationLoading}
            style={{
              width: '100%',
              padding: '0.625rem 2.5rem 0.625rem 0.75rem',
              fontSize: '0.9375rem',
              background: 'rgba(246, 237, 221, 0.05)',
              border: '1px solid rgba(246, 237, 221, 0.15)',
              borderRadius: '0.375rem',
              color: '#f6eddd',
              outline: 'none',
            }}
          />
          <svg
            style={{
              position: 'absolute',
              right: '0.75rem',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '1.125rem',
              height: '1.125rem',
              opacity: 0.4,
              pointerEvents: 'none',
            }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <circle cx="11" cy="11" r="8" strokeWidth="2" />
            <path strokeLinecap="round" strokeWidth="2" d="m21 21-4.35-4.35" />
          </svg>
        </div>

        <button
          type="submit"
          disabled={loading || locationLoading || !query.trim()}
          style={{
            padding: '0.625rem 1.25rem',
            fontSize: '0.9375rem',
            fontWeight: 500,
            background: 'rgba(246, 237, 221, 0.15)',
            border: 'none',
            borderRadius: '0.375rem',
            color: '#f6eddd',
            cursor: loading || locationLoading || !query.trim() ? 'not-allowed' : 'pointer',
            opacity: loading || locationLoading || !query.trim() ? 0.5 : 1,
            transition: 'all 0.15s ease',
          }}
        >
          {loading ? 'Searching...' : 'Search'}
        </button>

        <NearMeButton onClick={onNearMe} loading={locationLoading} disabled={loading} />
      </form>

      {/* Quick filters hint */}
      <div
        style={{
          marginTop: '0.75rem',
          display: 'flex',
          gap: '0.5rem',
          flexWrap: 'wrap',
        }}
      >
        {['Reformer', 'Mat Classes', 'Private Sessions'].map((filter) => (
          <span
            key={filter}
            style={{
              padding: '0.25rem 0.625rem',
              fontSize: '0.75rem',
              background: 'rgba(246, 237, 221, 0.05)',
              borderRadius: '9999px',
              color: 'rgba(246, 237, 221, 0.5)',
            }}
          >
            {filter}
          </span>
        ))}
      </div>
    </div>
  );
}
