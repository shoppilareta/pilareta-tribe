'use client';

import { useState, useEffect, useCallback } from 'react';
import type { UgcTag } from './hooks/useFeed';

interface TagSelectorProps {
  selectedTags: UgcTag[];
  onTagsChange: (tags: UgcTag[]) => void;
  disabled?: boolean;
  maxTags?: number;
}

export function TagSelector({
  selectedTags,
  onTagsChange,
  disabled,
  maxTags = 5,
}: TagSelectorProps) {
  const [availableTags, setAvailableTags] = useState<UgcTag[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await fetch('/api/ugc/tags');
        if (response.ok) {
          const data = await response.json();
          setAvailableTags(data.tags || []);
        }
      } catch {
        // Silently fail
      } finally {
        setLoading(false);
      }
    };

    fetchTags();
  }, []);

  const handleToggle = useCallback(
    (tag: UgcTag) => {
      const isSelected = selectedTags.some((t) => t.id === tag.id);

      if (isSelected) {
        onTagsChange(selectedTags.filter((t) => t.id !== tag.id));
      } else if (selectedTags.length < maxTags) {
        onTagsChange([...selectedTags, tag]);
      }
    },
    [selectedTags, onTagsChange, maxTags]
  );

  if (loading) {
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
          Tags (optional)
        </label>
        <div
          style={{
            color: 'rgba(246, 237, 221, 0.5)',
            fontSize: '0.8rem',
          }}
        >
          Loading tags...
        </div>
      </div>
    );
  }

  if (availableTags.length === 0) {
    return null;
  }

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
        Tags (optional, max {maxTags})
      </label>

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '8px',
        }}
      >
        {availableTags.map((tag) => {
          const isSelected = selectedTags.some((t) => t.id === tag.id);
          const isDisabledTag = !isSelected && selectedTags.length >= maxTags;

          return (
            <button
              key={tag.id}
              type="button"
              onClick={() => !disabled && !isDisabledTag && handleToggle(tag)}
              disabled={disabled || isDisabledTag}
              style={{
                padding: '6px 12px',
                background: isSelected
                  ? 'rgba(245, 158, 11, 0.2)'
                  : 'rgba(246, 237, 221, 0.05)',
                border: `1px solid ${isSelected ? '#f59e0b' : 'rgba(246, 237, 221, 0.1)'}`,
                borderRadius: '2px',
                color: isSelected ? '#f59e0b' : 'rgba(246, 237, 221, 0.7)',
                fontSize: '0.8rem',
                cursor: disabled || isDisabledTag ? 'not-allowed' : 'pointer',
                opacity: isDisabledTag ? 0.5 : 1,
                transition: 'all 0.2s ease',
              }}
            >
              #{tag.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
