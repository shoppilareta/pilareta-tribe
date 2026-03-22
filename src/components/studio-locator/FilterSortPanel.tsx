'use client';

import { useState } from 'react';

export type SortOption = 'nearest' | 'highest_rated';

export interface FilterState {
  openNow: boolean;
  amenities: string[];
}

const AMENITY_OPTIONS = ['Reformer', 'Mat', 'Showers', 'Parking', 'WiFi'];

interface FilterSortPanelProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
}

export function FilterSortPanel({ filters, onFiltersChange, sortBy, onSortChange }: FilterSortPanelProps) {
  const [expanded, setExpanded] = useState(false);

  const activeCount = (filters.openNow ? 1 : 0) + filters.amenities.length;

  const toggleAmenity = (amenity: string) => {
    const next = filters.amenities.includes(amenity)
      ? filters.amenities.filter((a) => a !== amenity)
      : [...filters.amenities, amenity];
    onFiltersChange({ ...filters, amenities: next });
  };

  const clearAll = () => {
    onFiltersChange({ openNow: false, amenities: [] });
    onSortChange('nearest');
  };

  const chipStyle = (active: boolean): React.CSSProperties => ({
    padding: '0.25rem 0.625rem',
    fontSize: '0.75rem',
    fontWeight: active ? 600 : 400,
    background: active ? 'rgba(246, 237, 221, 0.15)' : 'rgba(246, 237, 221, 0.05)',
    border: active ? '1px solid rgba(246, 237, 221, 0.3)' : '1px solid transparent',
    borderRadius: '9999px',
    color: active ? '#f6eddd' : 'rgba(246, 237, 221, 0.5)',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  });

  return (
    <div
      style={{
        borderBottom: '1px solid rgba(246, 237, 221, 0.1)',
      }}
    >
      {/* Toggle bar */}
      <div
        style={{
          padding: '0.5rem 1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.5rem',
        }}
      >
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          style={{
            background: 'none',
            border: 'none',
            color: 'rgba(246, 237, 221, 0.7)',
            fontSize: '0.8125rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.375rem',
            padding: 0,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 21v-7m0 0V5a2 2 0 012-2h2a2 2 0 012 2v9M4 14h4m12 7v-4m0 0V5a2 2 0 00-2-2h-2a2 2 0 00-2 2v12m4 0h-4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Filters & Sort
          {activeCount > 0 && (
            <span
              style={{
                background: 'rgba(246, 237, 221, 0.2)',
                borderRadius: '9999px',
                padding: '0 0.375rem',
                fontSize: '0.6875rem',
                fontWeight: 600,
                color: '#f6eddd',
              }}
            >
              {activeCount}
            </span>
          )}
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            style={{
              transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.15s ease',
            }}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        {/* Sort dropdown (always visible) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'rgba(246, 237, 221, 0.5)' }}>Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            style={{
              background: 'rgba(246, 237, 221, 0.05)',
              border: '1px solid rgba(246, 237, 221, 0.15)',
              borderRadius: '0.25rem',
              color: '#f6eddd',
              fontSize: '0.75rem',
              padding: '0.25rem 0.375rem',
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            <option value="nearest">Nearest</option>
            <option value="highest_rated">Highest Rated</option>
          </select>
        </div>
      </div>

      {/* Expanded filter area */}
      {expanded && (
        <div
          style={{
            padding: '0.5rem 1rem 0.75rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.625rem',
          }}
        >
          {/* Open Now */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={() => onFiltersChange({ ...filters, openNow: !filters.openNow })}
              style={chipStyle(filters.openNow)}
            >
              {filters.openNow ? '\u2713 ' : ''}Open Now
            </button>
          </div>

          {/* Amenities */}
          <div>
            <div style={{ fontSize: '0.6875rem', color: 'rgba(246, 237, 221, 0.4)', marginBottom: '0.375rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Amenities
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
              {AMENITY_OPTIONS.map((amenity) => {
                const active = filters.amenities.includes(amenity);
                return (
                  <button
                    key={amenity}
                    type="button"
                    onClick={() => toggleAmenity(amenity)}
                    style={chipStyle(active)}
                  >
                    {active ? '\u2713 ' : ''}{amenity}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Clear all */}
          {activeCount > 0 && (
            <button
              type="button"
              onClick={clearAll}
              style={{
                background: 'none',
                border: 'none',
                color: 'rgba(246, 237, 221, 0.5)',
                fontSize: '0.75rem',
                cursor: 'pointer',
                padding: 0,
                textDecoration: 'underline',
                alignSelf: 'flex-start',
              }}
            >
              Clear all filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}
