'use client';

import { useState, useEffect, useRef, FormEvent } from 'react';
import { NearMeButton } from './NearMeButton';

interface Suggestion {
  placeId: string;
  description: string;
}

interface SearchPanelProps {
  onSearch: (query: string) => void;
  onNearMe: () => void;
  loading: boolean;
  locationLoading: boolean;
}

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

export function SearchPanel({ onSearch, onNearMe, loading, locationLoading }: SearchPanelProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch autocomplete suggestions
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!query.trim() || query.length < 2 || !API_KEY) {
      setSuggestions([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/studios/autocomplete?input=${encodeURIComponent(query.trim())}`
        );
        if (res.ok) {
          const data = await res.json();
          setSuggestions(data.predictions ?? []);
          setShowSuggestions(true);
        }
      } catch {
        // Ignore errors
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  // Close suggestions on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setShowSuggestions(false);
      onSearch(query.trim());
    }
  };

  const handleSelectSuggestion = (suggestion: Suggestion) => {
    setQuery(suggestion.description);
    setShowSuggestions(false);
    setSuggestions([]);
    onSearch(suggestion.description);
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
        <div ref={containerRef} style={{ flex: '1 1 200px', position: 'relative' }}>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            placeholder="City or address..."
            disabled={loading || locationLoading}
            autoComplete="off"
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

          {/* Autocomplete suggestions dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                marginTop: '0.25rem',
                background: '#2a2d22',
                border: '1px solid rgba(246, 237, 221, 0.15)',
                borderRadius: '0.375rem',
                zIndex: 50,
                maxHeight: '200px',
                overflowY: 'auto',
              }}
            >
              {suggestions.map((s) => (
                <button
                  key={s.placeId}
                  type="button"
                  onClick={() => handleSelectSuggestion(s)}
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.75rem',
                    fontSize: '0.875rem',
                    color: '#f6eddd',
                    background: 'transparent',
                    border: 'none',
                    borderBottom: '1px solid rgba(246, 237, 221, 0.05)',
                    textAlign: 'left',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    (e.target as HTMLElement).style.background = 'rgba(246, 237, 221, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    (e.target as HTMLElement).style.background = 'transparent';
                  }}
                >
                  {s.description}
                </button>
              ))}
            </div>
          )}
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

      {/* Quick search suggestions */}
      <div
        style={{
          marginTop: '0.5rem',
          fontSize: '0.75rem',
          color: 'rgba(246, 237, 221, 0.4)',
        }}
      >
        Try: Mumbai, Bangalore, Delhi, Pune...
      </div>
    </div>
  );
}
