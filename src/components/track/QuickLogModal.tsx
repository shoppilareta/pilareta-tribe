'use client';

import { useState, useEffect, useRef } from 'react';

interface QuickLogModalProps {
  onClose: () => void;
  onComplete: () => void;
  prefill?: {
    sessionId?: string;
    sessionName?: string;
    durationMinutes?: number;
    workoutType?: string;
    focusAreas?: string[];
    studioId?: string;
    studioName?: string;
  };
}

interface Studio {
  id: string;
  name: string;
  city: string;
}

const DURATION_OPTIONS = [15, 20, 30, 45, 60];
const WORKOUT_TYPES = [
  { value: 'reformer', label: 'Reformer' },
  { value: 'mat', label: 'Mat' },
  { value: 'tower', label: 'Tower' },
  { value: 'other', label: 'Other' }
];
const FOCUS_AREAS = [
  { value: 'core', label: 'Core' },
  { value: 'glutes', label: 'Glutes' },
  { value: 'legs', label: 'Legs' },
  { value: 'arms', label: 'Arms' },
  { value: 'back', label: 'Back' },
  { value: 'mobility', label: 'Mobility' }
];

export function QuickLogModal({ onClose, onComplete, prefill }: QuickLogModalProps) {
  const [workoutDate, setWorkoutDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [durationMinutes, setDurationMinutes] = useState<number>(prefill?.durationMinutes || 30);
  const [customDuration, setCustomDuration] = useState<string>('');
  const [workoutType, setWorkoutType] = useState<string>(prefill?.workoutType || 'reformer');
  const [rpe, setRpe] = useState<number>(5);
  const [focusAreas, setFocusAreas] = useState<string[]>(prefill?.focusAreas || []);
  const [notes, setNotes] = useState<string>('');
  const [showMore, setShowMore] = useState<boolean>(false);
  const [studioId, setStudioId] = useState<string | null>(prefill?.studioId || null);
  const [studioName, setStudioName] = useState<string>(prefill?.studioName || '');
  const [studioSearch, setStudioSearch] = useState<string>('');
  const [studioResults, setStudioResults] = useState<Studio[]>([]);
  const [showStudioDropdown, setShowStudioDropdown] = useState<boolean>(false);
  const [customStudioName, setCustomStudioName] = useState<string>('');
  const [useCustomStudio, setUseCustomStudio] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Generate date options (today and past 7 days)
  const dateOptions: { value: string; label: string }[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const value = date.toISOString().split('T')[0];
    let label = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    if (i === 0) label = 'Today';
    if (i === 1) label = 'Yesterday';
    dateOptions.push({ value, label });
  }

  // Search studios
  useEffect(() => {
    if (!studioSearch || studioSearch.length < 2) {
      setStudioResults([]);
      return;
    }

    const searchStudios = async () => {
      try {
        const response = await fetch(`/api/studios?q=${encodeURIComponent(studioSearch)}&limit=5`);
        if (response.ok) {
          const data = await response.json();
          setStudioResults(data.studios || []);
        }
      } catch {
        // Ignore errors
      }
    };

    const debounce = setTimeout(searchStudios, 300);
    return () => clearTimeout(debounce);
  }, [studioSearch]);

  const handleDurationClick = (mins: number) => {
    setDurationMinutes(mins);
    setCustomDuration('');
  };

  const handleCustomDurationChange = (value: string) => {
    setCustomDuration(value);
    const parsed = parseInt(value, 10);
    if (!isNaN(parsed) && parsed > 0) {
      setDurationMinutes(parsed);
    }
  };

  const toggleFocusArea = (area: string) => {
    setFocusAreas((prev) =>
      prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]
    );
  };

  const selectStudio = (studio: Studio) => {
    setStudioId(studio.id);
    setStudioName(studio.name);
    setStudioSearch('');
    setShowStudioDropdown(false);
    setUseCustomStudio(false);
    setCustomStudioName('');
  };

  const clearStudio = () => {
    setStudioId(null);
    setStudioName('');
    setStudioSearch('');
    setUseCustomStudio(false);
    setCustomStudioName('');
  };

  const useCustomStudioInput = () => {
    setUseCustomStudio(true);
    setCustomStudioName(studioSearch);
    setStudioId(null);
    setStudioName('');
    setShowStudioDropdown(false);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Only images are allowed (JPEG, PNG, WebP)');
      return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      setError('Image too large. Maximum size: 10MB');
      return;
    }

    setImageFile(file);
    setError(null);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getRpeLabel = (value: number) => {
    if (value <= 2) return 'Very light';
    if (value <= 4) return 'Light';
    if (value <= 6) return 'Moderate';
    if (value <= 8) return 'Hard';
    return 'All-out';
  };

  const getRpeColor = (value: number) => {
    if (value <= 3) return 'rgba(34, 197, 94, 0.8)';
    if (value <= 5) return 'rgba(234, 179, 8, 0.8)';
    if (value <= 7) return 'rgba(249, 115, 22, 0.8)';
    return 'rgba(239, 68, 68, 0.8)';
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      let response: Response;

      if (imageFile) {
        // Use FormData when we have an image
        const formData = new FormData();
        formData.append('workoutDate', workoutDate);
        formData.append('durationMinutes', String(durationMinutes));
        formData.append('workoutType', workoutType);
        formData.append('rpe', String(rpe));
        if (focusAreas.length > 0) {
          formData.append('focusAreas', JSON.stringify(focusAreas));
        }
        if (notes) formData.append('notes', notes);
        if (studioId) formData.append('studioId', studioId);
        if (useCustomStudio && customStudioName) formData.append('customStudioName', customStudioName);
        if (prefill?.sessionId) formData.append('sessionId', prefill.sessionId);
        formData.append('image', imageFile);

        response = await fetch('/api/track/logs', {
          method: 'POST',
          body: formData,
        });
      } else {
        // Use JSON when no image
        response = await fetch('/api/track/logs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            workoutDate,
            durationMinutes,
            workoutType,
            rpe,
            focusAreas: focusAreas.length > 0 ? focusAreas : undefined,
            notes: notes || undefined,
            studioId: studioId || undefined,
            customStudioName: useCustomStudio && customStudioName ? customStudioName : undefined,
            sessionId: prefill?.sessionId || undefined
          })
        });
      }

      if (response.ok) {
        onComplete();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to log workout');
      }
    } catch {
      setError('Failed to log workout');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem'
      }}
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(4px)'
        }}
      />

      {/* Modal */}
      <div
        className="card"
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '28rem',
          maxHeight: '90vh',
          overflow: 'auto'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Log Workout</h2>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'rgba(246, 237, 221, 0.6)',
              cursor: 'pointer',
              padding: '0.25rem'
            }}
          >
            <svg style={{ width: '1.5rem', height: '1.5rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Prefill info */}
        {prefill?.sessionName && (
          <div style={{
            marginBottom: '1rem',
            padding: '0.75rem',
            background: 'rgba(246, 237, 221, 0.1)',
            borderRadius: '0.5rem',
            fontSize: '0.875rem'
          }}>
            <span style={{ opacity: 0.6 }}>Logging: </span>
            <span style={{ fontWeight: 500 }}>{prefill.sessionName}</span>
          </div>
        )}

        {/* Date */}
        <div style={{ marginBottom: '1.25rem' }}>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>
            When?
          </label>
          <select
            value={workoutDate}
            onChange={(e) => setWorkoutDate(e.target.value)}
            style={{
              width: '100%',
              padding: '0.625rem',
              background: 'rgba(246, 237, 221, 0.1)',
              border: '1px solid rgba(246, 237, 221, 0.2)',
              borderRadius: '0.5rem',
              color: '#f6eddd',
              fontSize: '0.9375rem',
              cursor: 'pointer'
            }}
          >
            {dateOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* Duration */}
        <div style={{ marginBottom: '1.25rem' }}>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>
            Duration
          </label>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {DURATION_OPTIONS.map((mins) => (
              <button
                key={mins}
                onClick={() => handleDurationClick(mins)}
                style={{
                  padding: '0.5rem 0.875rem',
                  borderRadius: '0.5rem',
                  border: '1px solid rgba(246, 237, 221, 0.2)',
                  background: durationMinutes === mins && !customDuration
                    ? 'rgba(246, 237, 221, 0.2)'
                    : 'transparent',
                  color: '#f6eddd',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: durationMinutes === mins && !customDuration ? 500 : 400
                }}
              >
                {mins}
              </button>
            ))}
            <input
              type="number"
              placeholder="Custom"
              value={customDuration}
              onChange={(e) => handleCustomDurationChange(e.target.value)}
              style={{
                width: '5rem',
                padding: '0.5rem',
                borderRadius: '0.5rem',
                border: '1px solid rgba(246, 237, 221, 0.2)',
                background: customDuration ? 'rgba(246, 237, 221, 0.2)' : 'transparent',
                color: '#f6eddd',
                fontSize: '0.875rem',
                textAlign: 'center'
              }}
              min={1}
              max={180}
            />
          </div>
        </div>

        {/* Workout Type */}
        <div style={{ marginBottom: '1.25rem' }}>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>
            Type
          </label>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {WORKOUT_TYPES.map((type) => (
              <button
                key={type.value}
                onClick={() => setWorkoutType(type.value)}
                style={{
                  padding: '0.5rem 0.875rem',
                  borderRadius: '0.5rem',
                  border: '1px solid rgba(246, 237, 221, 0.2)',
                  background: workoutType === type.value ? 'rgba(246, 237, 221, 0.2)' : 'transparent',
                  color: '#f6eddd',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: workoutType === type.value ? 500 : 400
                }}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* RPE Slider */}
        <div style={{ marginBottom: '1.25rem' }}>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>
            Intensity (RPE)
          </label>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            marginBottom: '0.5rem'
          }}>
            <span style={{ fontSize: '0.75rem', color: 'rgba(246, 237, 221, 0.5)', width: '1rem' }}>1</span>
            <input
              type="range"
              min={1}
              max={10}
              value={rpe}
              onChange={(e) => setRpe(parseInt(e.target.value, 10))}
              style={{
                flex: 1,
                height: '8px',
                borderRadius: '4px',
                background: `linear-gradient(to right, ${getRpeColor(rpe)} 0%, ${getRpeColor(rpe)} ${(rpe - 1) * 11.1}%, rgba(246, 237, 221, 0.2) ${(rpe - 1) * 11.1}%)`,
                appearance: 'none',
                cursor: 'pointer'
              }}
            />
            <span style={{ fontSize: '0.75rem', color: 'rgba(246, 237, 221, 0.5)', width: '1.25rem' }}>10</span>
          </div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.8125rem'
          }}>
            <span style={{ color: 'rgba(246, 237, 221, 0.6)' }}>{getRpeLabel(rpe)}</span>
            <span style={{
              fontWeight: 600,
              padding: '0.25rem 0.5rem',
              borderRadius: '0.25rem',
              background: getRpeColor(rpe),
              color: '#fff'
            }}>
              {rpe}
            </span>
          </div>
        </div>

        {/* More Options Toggle */}
        <button
          onClick={() => setShowMore(!showMore)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'transparent',
            border: 'none',
            color: 'rgba(246, 237, 221, 0.7)',
            cursor: 'pointer',
            fontSize: '0.875rem',
            padding: '0.5rem 0',
            marginBottom: showMore ? '1rem' : '1.5rem'
          }}
        >
          <svg
            style={{
              width: '1rem',
              height: '1rem',
              transform: showMore ? 'rotate(180deg)' : 'none',
              transition: 'transform 0.2s ease'
            }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
          {showMore ? 'Less options' : 'More options'}
        </button>

        {/* More Options */}
        {showMore && (
          <div style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Focus Areas */}
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>
                Focus Areas
              </label>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {FOCUS_AREAS.map((area) => (
                  <button
                    key={area.value}
                    onClick={() => toggleFocusArea(area.value)}
                    style={{
                      padding: '0.375rem 0.75rem',
                      borderRadius: '0.5rem',
                      border: '1px solid rgba(246, 237, 221, 0.2)',
                      background: focusAreas.includes(area.value) ? 'rgba(99, 102, 241, 0.3)' : 'transparent',
                      color: '#f6eddd',
                      cursor: 'pointer',
                      fontSize: '0.8125rem'
                    }}
                  >
                    {area.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Studio */}
            <div style={{ position: 'relative' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>
                Studio (optional)
              </label>
              {studioId ? (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.625rem',
                  background: 'rgba(246, 237, 221, 0.1)',
                  borderRadius: '0.5rem'
                }}>
                  <span>{studioName}</span>
                  <button
                    onClick={clearStudio}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'rgba(246, 237, 221, 0.6)',
                      cursor: 'pointer'
                    }}
                  >
                    <svg style={{ width: '1rem', height: '1rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ) : useCustomStudio ? (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}>
                  <input
                    type="text"
                    placeholder="Enter studio name..."
                    value={customStudioName}
                    onChange={(e) => setCustomStudioName(e.target.value)}
                    style={{
                      flex: 1,
                      padding: '0.625rem',
                      background: 'rgba(246, 237, 221, 0.1)',
                      border: '1px solid rgba(246, 237, 221, 0.2)',
                      borderRadius: '0.5rem',
                      color: '#f6eddd',
                      fontSize: '0.9375rem'
                    }}
                  />
                  <button
                    onClick={clearStudio}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'rgba(246, 237, 221, 0.6)',
                      cursor: 'pointer',
                      padding: '0.5rem'
                    }}
                  >
                    <svg style={{ width: '1rem', height: '1rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ) : (
                <>
                  <input
                    type="text"
                    placeholder="Search studios..."
                    value={studioSearch}
                    onChange={(e) => {
                      setStudioSearch(e.target.value);
                      setShowStudioDropdown(true);
                    }}
                    onFocus={() => setShowStudioDropdown(true)}
                    style={{
                      width: '100%',
                      padding: '0.625rem',
                      background: 'rgba(246, 237, 221, 0.1)',
                      border: '1px solid rgba(246, 237, 221, 0.2)',
                      borderRadius: '0.5rem',
                      color: '#f6eddd',
                      fontSize: '0.9375rem'
                    }}
                  />
                  {showStudioDropdown && (studioResults.length > 0 || studioSearch.length >= 2) && (
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      marginTop: '0.25rem',
                      background: '#2a2b25',
                      borderRadius: '0.5rem',
                      border: '1px solid rgba(246, 237, 221, 0.2)',
                      overflow: 'hidden',
                      zIndex: 10,
                      maxHeight: '200px',
                      overflowY: 'auto'
                    }}>
                      {studioResults.map((studio) => (
                        <button
                          key={studio.id}
                          onClick={() => selectStudio(studio)}
                          style={{
                            display: 'block',
                            width: '100%',
                            padding: '0.75rem',
                            textAlign: 'left',
                            background: 'transparent',
                            border: 'none',
                            color: '#f6eddd',
                            cursor: 'pointer',
                            borderBottom: '1px solid rgba(246, 237, 221, 0.1)'
                          }}
                        >
                          <div style={{ fontWeight: 500 }}>{studio.name}</div>
                          <div style={{ fontSize: '0.8125rem', color: 'rgba(246, 237, 221, 0.6)' }}>{studio.city}</div>
                        </button>
                      ))}
                      {/* Option to enter custom studio */}
                      {studioSearch.length >= 2 && (
                        <button
                          onClick={useCustomStudioInput}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            width: '100%',
                            padding: '0.75rem',
                            textAlign: 'left',
                            background: 'rgba(99, 102, 241, 0.1)',
                            border: 'none',
                            color: '#f6eddd',
                            cursor: 'pointer'
                          }}
                        >
                          <svg style={{ width: '1rem', height: '1rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          <span>Use &quot;{studioSearch}&quot; as custom studio</span>
                        </button>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Notes */}
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>
                Notes (optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="How did it feel? Any highlights?"
                rows={2}
                style={{
                  width: '100%',
                  padding: '0.625rem',
                  background: 'rgba(246, 237, 221, 0.1)',
                  border: '1px solid rgba(246, 237, 221, 0.2)',
                  borderRadius: '0.5rem',
                  color: '#f6eddd',
                  fontSize: '0.9375rem',
                  resize: 'vertical'
                }}
              />
            </div>

            {/* Image Upload */}
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>
                Photo (optional)
              </label>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageSelect}
                accept="image/jpeg,image/png,image/webp"
                style={{ display: 'none' }}
              />
              {imagePreview ? (
                <div style={{ position: 'relative' }}>
                  <div
                    style={{
                      width: '100%',
                      height: '120px',
                      borderRadius: '0.5rem',
                      overflow: 'hidden',
                      background: 'rgba(246, 237, 221, 0.1)'
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imagePreview}
                      alt="Workout preview"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                  </div>
                  <button
                    onClick={removeImage}
                    type="button"
                    style={{
                      position: 'absolute',
                      top: '0.5rem',
                      right: '0.5rem',
                      width: '1.75rem',
                      height: '1.75rem',
                      borderRadius: '50%',
                      background: 'rgba(0, 0, 0, 0.7)',
                      border: 'none',
                      color: '#fff',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <svg style={{ width: '1rem', height: '1rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  type="button"
                  style={{
                    width: '100%',
                    padding: '1rem',
                    background: 'rgba(246, 237, 221, 0.05)',
                    border: '2px dashed rgba(246, 237, 221, 0.2)',
                    borderRadius: '0.5rem',
                    color: 'rgba(246, 237, 221, 0.6)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.875rem',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(246, 237, 221, 0.1)';
                    e.currentTarget.style.borderColor = 'rgba(246, 237, 221, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(246, 237, 221, 0.05)';
                    e.currentTarget.style.borderColor = 'rgba(246, 237, 221, 0.2)';
                  }}
                >
                  <svg style={{ width: '1.5rem', height: '1.5rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>Add a photo from your workout</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{
            marginBottom: '1rem',
            padding: '0.75rem',
            background: 'rgba(239, 68, 68, 0.2)',
            borderRadius: '0.5rem',
            fontSize: '0.875rem',
            color: 'rgba(239, 68, 68, 1)'
          }}>
            {error}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={onClose}
            className="btn btn-outline"
            style={{ flex: 1 }}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="btn btn-primary"
            style={{ flex: 1 }}
            disabled={loading}
          >
            {loading ? 'Logging...' : 'Log Workout'}
          </button>
        </div>
      </div>
    </div>
  );
}
