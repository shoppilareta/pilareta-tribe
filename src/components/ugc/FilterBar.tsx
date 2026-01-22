'use client';

import { useState, useEffect } from 'react';
import type { UgcTag } from './hooks/useFeed';

interface FilterBarProps {
  selectedTag: string | null;
  onTagChange: (tagSlug: string | null) => void;
}

export function FilterBar({ selectedTag, onTagChange }: FilterBarProps) {
  const [tags, setTags] = useState<UgcTag[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await fetch('/api/ugc/tags');
        if (response.ok) {
          const data = await response.json();
          setTags(data.tags || []);
        }
      } catch {
        // Silently fail
      } finally {
        setLoading(false);
      }
    };

    fetchTags();
  }, []);

  if (loading || tags.length === 0) {
    return null;
  }

  return (
    <div
      style={{
        padding: '0.75rem 1rem',
        borderBottom: '1px solid rgba(246, 237, 221, 0.1)',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        overflowX: 'auto',
      }}
    >
      <span
        style={{
          fontSize: '0.75rem',
          color: 'rgba(246, 237, 221, 0.5)',
          flexShrink: 0,
        }}
      >
        Filter:
      </span>

      {/* All button */}
      <button
        type="button"
        onClick={() => onTagChange(null)}
        style={{
          padding: '4px 12px',
          background: selectedTag === null ? '#f6eddd' : 'rgba(246, 237, 221, 0.05)',
          border: 'none',
          borderRadius: '2px',
          color: selectedTag === null ? '#1a1a1a' : 'rgba(246, 237, 221, 0.7)',
          fontSize: '0.8rem',
          cursor: 'pointer',
          flexShrink: 0,
          transition: 'all 0.2s ease',
        }}
      >
        All
      </button>

      {/* Tag buttons */}
      {tags.map((tag) => (
        <button
          key={tag.id}
          type="button"
          onClick={() => onTagChange(tag.slug)}
          style={{
            padding: '4px 12px',
            background: selectedTag === tag.slug ? '#f6eddd' : 'rgba(246, 237, 221, 0.05)',
            border: 'none',
            borderRadius: '2px',
            color: selectedTag === tag.slug ? '#1a1a1a' : 'rgba(246, 237, 221, 0.7)',
            fontSize: '0.8rem',
            cursor: 'pointer',
            flexShrink: 0,
            transition: 'all 0.2s ease',
          }}
        >
          #{tag.name}
        </button>
      ))}
    </div>
  );
}
