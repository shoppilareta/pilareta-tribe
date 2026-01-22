'use client';

import { useState, useEffect, useCallback } from 'react';

interface Studio {
  id: string;
  name: string;
  city: string;
}

interface StudioSelectorProps {
  selectedStudioId: string | null;
  onSelect: (studioId: string | null) => void;
  disabled?: boolean;
}

export function StudioSelector({ selectedStudioId, onSelect, disabled }: StudioSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [studios, setStudios] = useState<Studio[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedStudio, setSelectedStudio] = useState<Studio | null>(null);

  // Fetch studios when search changes
  useEffect(() => {
    if (!search.trim()) {
      setStudios([]);
      return;
    }

    const searchStudios = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/studios/search?q=${encodeURIComponent(search)}`);
        if (response.ok) {
          const data = await response.json();
          setStudios(data.studios || []);
        }
      } catch {
        // Silently fail
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(searchStudios, 300);
    return () => clearTimeout(debounce);
  }, [search]);

  const handleSelect = useCallback(
    (studio: Studio) => {
      setSelectedStudio(studio);
      onSelect(studio.id);
      setIsOpen(false);
      setSearch('');
    },
    [onSelect]
  );

  const handleClear = useCallback(() => {
    setSelectedStudio(null);
    onSelect(null);
  }, [onSelect]);

  return (
    <div style={{ marginTop: '1rem' }}>
      <label
        style={{
          display: 'block',
          marginBottom: '6px',
          fontSize: '0.875rem',
          color: 'rgba(246, 237, 221, 0.8)',
        }}
      >
        Tag a Studio (optional)
      </label>

      {selectedStudio ? (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 12px',
            background: 'rgba(246, 237, 221, 0.05)',
            border: '1px solid rgba(246, 237, 221, 0.1)',
            borderRadius: '2px',
          }}
        >
          <div>
            <span style={{ color: '#f6eddd', fontSize: '0.875rem' }}>
              {selectedStudio.name}
            </span>
            <span
              style={{
                color: 'rgba(246, 237, 221, 0.5)',
                fontSize: '0.75rem',
                marginLeft: '8px',
              }}
            >
              {selectedStudio.city}
            </span>
          </div>
          {!disabled && (
            <button
              type="button"
              onClick={handleClear}
              style={{
                background: 'none',
                border: 'none',
                color: 'rgba(246, 237, 221, 0.5)',
                cursor: 'pointer',
                padding: '2px',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>
      ) : (
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            placeholder="Search for a studio..."
            disabled={disabled}
            style={{
              width: '100%',
              padding: '10px 12px',
              background: 'rgba(246, 237, 221, 0.05)',
              border: '1px solid rgba(246, 237, 221, 0.1)',
              borderRadius: '2px',
              color: '#f6eddd',
              fontSize: '0.875rem',
              outline: 'none',
            }}
          />

          {isOpen && search.trim() && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                marginTop: '4px',
                background: '#1a1a1a',
                border: '1px solid rgba(246, 237, 221, 0.1)',
                borderRadius: '2px',
                maxHeight: '200px',
                overflowY: 'auto',
                zIndex: 10,
              }}
            >
              {loading ? (
                <div
                  style={{
                    padding: '12px',
                    textAlign: 'center',
                    color: 'rgba(246, 237, 221, 0.5)',
                    fontSize: '0.875rem',
                  }}
                >
                  Searching...
                </div>
              ) : studios.length === 0 ? (
                <div
                  style={{
                    padding: '12px',
                    textAlign: 'center',
                    color: 'rgba(246, 237, 221, 0.5)',
                    fontSize: '0.875rem',
                  }}
                >
                  No studios found
                </div>
              ) : (
                studios.map((studio) => (
                  <button
                    key={studio.id}
                    type="button"
                    onClick={() => handleSelect(studio)}
                    style={{
                      display: 'block',
                      width: '100%',
                      padding: '10px 12px',
                      background: 'transparent',
                      border: 'none',
                      borderBottom: '1px solid rgba(246, 237, 221, 0.05)',
                      textAlign: 'left',
                      cursor: 'pointer',
                      color: '#f6eddd',
                    }}
                  >
                    <span style={{ fontSize: '0.875rem' }}>{studio.name}</span>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        color: 'rgba(246, 237, 221, 0.5)',
                        marginLeft: '8px',
                      }}
                    >
                      {studio.city}
                    </span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
