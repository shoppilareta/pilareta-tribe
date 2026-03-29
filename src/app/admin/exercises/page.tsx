'use client';

import { useState, useEffect } from 'react';

interface ExerciseSummary {
  id: string;
  slug: string;
  name: string;
  equipment: string;
  difficulty: string;
  videoUrl: string | null;
  imageUrl: string | null;
  isVerified: boolean;
  focusAreas: string[];
}

interface ExerciseDetail {
  id: string;
  slug: string;
  name: string;
  description: string;
  equipment: string;
  difficulty: string;
  focusAreas: string[];
  setupSteps: string[];
  executionSteps: string[];
  cues: string[];
  commonMistakes: string[];
  defaultReps: number | null;
  defaultDuration: number | null;
  defaultSets: number;
  defaultTempo: string | null;
  rpeTarget: number;
  videoUrl: string | null;
  imageUrl: string | null;
  videoTimestamps: unknown;
  multiAngleVideos: unknown;
  isVerified: boolean;
  instructorNotes: string | null;
}

interface ExerciseFormData {
  name: string;
  slug: string;
  description: string;
  equipment: string;
  difficulty: string;
  focusAreas: string[];
  defaultSets: number;
  defaultReps: string;
  defaultTempo: string;
  rpeTarget: number;
  cues: string;
  imageUrl: string;
  videoUrl: string;
  instructorNotes: string;
}

const EQUIPMENT_OPTIONS = ['reformer', 'mat', 'both'];
const DIFFICULTY_OPTIONS = ['beginner', 'intermediate', 'advanced'];
const FOCUS_AREA_OPTIONS = ['core', 'glutes', 'legs', 'arms', 'back', 'posture', 'mobility'];

const textColor = '#f6eddd';
const mutedColor = 'rgba(246,237,221,0.5)';
const cardBg = 'rgba(246,237,221,0.03)';
const borderColor = 'rgba(246,237,221,0.08)';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

const emptyForm: ExerciseFormData = {
  name: '',
  slug: '',
  description: '',
  equipment: 'reformer',
  difficulty: 'beginner',
  focusAreas: [],
  defaultSets: 1,
  defaultReps: '',
  defaultTempo: '',
  rpeTarget: 5,
  cues: '',
  imageUrl: '',
  videoUrl: '',
  instructorNotes: '',
};

export default function ExercisesAdminPage() {
  const [exercises, setExercises] = useState<ExerciseSummary[]>([]);
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<ExerciseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  // Editable fields (detail panel)
  const [videoUrl, setVideoUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [instructorNotes, setInstructorNotes] = useState('');
  const [isVerified, setIsVerified] = useState(false);

  // Create/Edit modal
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ExerciseFormData>(emptyForm);
  const [modalSaving, setModalSaving] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  // Bulk verify
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkVerifying, setBulkVerifying] = useState(false);

  useEffect(() => {
    fetchExercises();
  }, [search]);

  useEffect(() => {
    if (selectedId) fetchDetail(selectedId);
  }, [selectedId]);

  async function fetchExercises() {
    setLoading(true);
    try {
      const params = search ? `?search=${encodeURIComponent(search)}` : '';
      const res = await fetch(`/api/admin/exercises${params}`);
      const data = await res.json();
      setExercises(data.exercises || []);
    } catch {
      setExercises([]);
    } finally {
      setLoading(false);
    }
  }

  async function fetchDetail(id: string) {
    try {
      const res = await fetch(`/api/admin/exercises/${id}`);
      const data = await res.json();
      if (data.exercise) {
        setDetail(data.exercise);
        setVideoUrl(data.exercise.videoUrl || '');
        setImageUrl(data.exercise.imageUrl || '');
        setInstructorNotes(data.exercise.instructorNotes || '');
        setIsVerified(data.exercise.isVerified);
      }
    } catch {
      setDetail(null);
    }
  }

  async function handleSave() {
    if (!selectedId) return;
    setSaving(true);
    setMessage('');
    try {
      const res = await fetch(`/api/admin/exercises/${selectedId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoUrl: videoUrl || null,
          imageUrl: imageUrl || null,
          instructorNotes: instructorNotes || null,
          isVerified,
        }),
      });
      if (res.ok) {
        setMessage('Saved successfully');
        fetchExercises();
      } else {
        const data = await res.json();
        setMessage(data.error || 'Failed to save');
      }
    } catch {
      setMessage('Failed to save');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!window.confirm(`Are you sure you want to delete "${name}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/admin/exercises/${id}`, { method: 'DELETE' });
      if (res.ok) {
        alert('Exercise deleted successfully');
        if (selectedId === id) {
          setSelectedId(null);
          setDetail(null);
        }
        fetchExercises();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete exercise');
      }
    } catch {
      alert('Failed to delete exercise');
    }
  }

  function openCreateModal() {
    setEditingId(null);
    setForm(emptyForm);
    setModalMessage('');
    setShowModal(true);
  }

  async function openEditModal(id: string) {
    setModalMessage('');
    try {
      const res = await fetch(`/api/admin/exercises/${id}`);
      const data = await res.json();
      if (data.exercise) {
        const ex = data.exercise;
        setEditingId(id);
        setForm({
          name: ex.name || '',
          slug: ex.slug || '',
          description: ex.description || '',
          equipment: ex.equipment || 'reformer',
          difficulty: ex.difficulty || 'beginner',
          focusAreas: ex.focusAreas || [],
          defaultSets: ex.defaultSets ?? 1,
          defaultReps: ex.defaultReps != null ? String(ex.defaultReps) : '',
          defaultTempo: ex.defaultTempo || '',
          rpeTarget: ex.rpeTarget ?? 5,
          cues: (ex.cues || []).join('\n'),
          imageUrl: ex.imageUrl || '',
          videoUrl: ex.videoUrl || '',
          instructorNotes: ex.instructorNotes || '',
        });
        setShowModal(true);
      }
    } catch {
      alert('Failed to load exercise for editing');
    }
  }

  async function handleModalSave() {
    if (!form.name || !form.equipment || !form.difficulty) {
      setModalMessage('Name, equipment, and difficulty are required');
      return;
    }
    const slug = form.slug || slugify(form.name);
    if (!slug) {
      setModalMessage('Could not generate a valid slug from the name');
      return;
    }

    setModalSaving(true);
    setModalMessage('');

    const payload = {
      name: form.name,
      slug,
      description: form.description,
      equipment: form.equipment,
      difficulty: form.difficulty,
      focusAreas: form.focusAreas,
      defaultSets: form.defaultSets,
      defaultReps: form.defaultReps ? parseInt(form.defaultReps) : null,
      defaultTempo: form.defaultTempo || null,
      rpeTarget: form.rpeTarget,
      cues: form.cues ? form.cues.split('\n').filter((l) => l.trim()) : [],
      imageUrl: form.imageUrl || null,
      videoUrl: form.videoUrl || null,
      instructorNotes: form.instructorNotes || null,
    };

    try {
      const url = editingId ? `/api/admin/exercises/${editingId}` : '/api/admin/exercises';
      const method = editingId ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        alert(editingId ? 'Exercise updated successfully' : 'Exercise created successfully');
        setShowModal(false);
        fetchExercises();
        if (editingId && selectedId === editingId) fetchDetail(editingId);
      } else {
        const data = await res.json();
        setModalMessage(data.error || 'Failed to save');
      }
    } catch {
      setModalMessage('Failed to save');
    } finally {
      setModalSaving(false);
    }
  }

  function toggleBulkSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    if (selectedIds.size === exercises.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(exercises.map((e) => e.id)));
    }
  }

  async function handleBulkAction(action: string) {
    if (selectedIds.size === 0) return;
    const label = action === 'verify' ? 'verify' : 'delete';
    if (!window.confirm(`${label.charAt(0).toUpperCase() + label.slice(1)} ${selectedIds.size} selected exercise(s)?`)) return;
    setBulkVerifying(true);
    try {
      const res = await fetch('/api/admin/bulk-operations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, entityType: 'exercises', ids: Array.from(selectedIds) }),
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || 'Bulk operation failed');
        return;
      }
      const data = await res.json();
      alert(`${data.count} exercise(s) ${label === 'verify' ? 'verified' : 'deleted'} successfully`);
      setSelectedIds(new Set());
      fetchExercises();
      if (selectedId) fetchDetail(selectedId);
    } catch {
      alert('Bulk operation failed');
    } finally {
      setBulkVerifying(false);
    }
  }

  function toggleFocusArea(area: string) {
    setForm((prev) => ({
      ...prev,
      focusAreas: prev.focusAreas.includes(area)
        ? prev.focusAreas.filter((a) => a !== area)
        : [...prev.focusAreas, area],
    }));
  }

  const hasVideo = (e: ExerciseSummary) => !!e.videoUrl;

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '8px 12px',
    borderRadius: 8,
    border: `1px solid ${borderColor}`,
    background: 'rgba(246,237,221,0.02)',
    color: textColor,
    fontSize: 13,
    outline: 'none',
    boxSizing: 'border-box',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: 11,
    color: mutedColor,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
  };

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexShrink: 0 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 600, color: textColor, margin: 0 }}>
            Exercises
          </h1>
          <p style={{ fontSize: 13, color: mutedColor, marginTop: 4 }}>
            Manage exercise library
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {selectedIds.size > 0 && (
            <button
              onClick={() => handleBulkAction('verify')}
              disabled={bulkVerifying}
              style={{
                padding: '8px 16px',
                borderRadius: 8,
                border: '1px solid rgba(100,181,246,0.3)',
                background: 'rgba(100,181,246,0.08)',
                color: '#64b5f6',
                fontSize: 13,
                fontWeight: 500,
                cursor: bulkVerifying ? 'not-allowed' : 'pointer',
                opacity: bulkVerifying ? 0.5 : 1,
              }}
            >
              {bulkVerifying ? 'Processing...' : `Verify Selected (${selectedIds.size})`}
            </button>
          )}
          <button
            onClick={openCreateModal}
            style={{
              padding: '8px 20px',
              borderRadius: 8,
              border: 'none',
              background: textColor,
              color: '#1a1a1a',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Create Exercise
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
        {/* Left: Exercise list */}
        <div style={{ width: '100%', maxWidth: 500 }}>
          <input
            type="text"
            placeholder="Search exercises..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: 8,
              border: `1px solid ${borderColor}`,
              background: cardBg,
              color: textColor,
              fontSize: 13,
              marginBottom: 12,
              outline: 'none',
            }}
          />

          {/* Select All */}
          {exercises.length > 0 && (
            <div style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
              <input
                type="checkbox"
                checked={selectedIds.size === exercises.length && exercises.length > 0}
                onChange={toggleSelectAll}
                style={{ accentColor: '#64b5f6' }}
              />
              <span style={{ fontSize: 12, color: mutedColor }}>Select all</span>
            </div>
          )}

          {loading ? (
            <p style={{ color: mutedColor, fontSize: 13 }}>Loading...</p>
          ) : (
            <div style={{ maxHeight: '70vh', overflowY: 'auto' }}>
              {exercises.map((ex) => (
                <div
                  key={ex.id}
                  style={{
                    padding: '10px 12px',
                    borderRadius: 8,
                    background: selectedId === ex.id ? 'rgba(246,237,221,0.08)' : 'transparent',
                    marginBottom: 2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedIds.has(ex.id)}
                    onChange={() => toggleBulkSelect(ex.id)}
                    onClick={(e) => e.stopPropagation()}
                    style={{ accentColor: '#64b5f6', flexShrink: 0 }}
                  />
                  <div
                    onClick={() => setSelectedId(ex.id)}
                    style={{ flex: 1, cursor: 'pointer' }}
                  >
                    <div style={{ fontSize: 13, fontWeight: 500, color: '#f6eddd' }}>
                      {ex.name || '(Unnamed)'}
                    </div>
                    <div style={{ fontSize: 11, color: 'rgba(246,237,221,0.5)', marginTop: 2 }}>
                      {ex.equipment || 'no equipment'} · {ex.difficulty || 'no level'}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 }}>
                    {hasVideo(ex) && (
                      <span style={{
                        fontSize: 10,
                        padding: '2px 6px',
                        borderRadius: 4,
                        background: 'rgba(129,199,132,0.15)',
                        color: '#81c784',
                      }}>
                        Video
                      </span>
                    )}
                    {ex.isVerified && (
                      <span style={{
                        fontSize: 10,
                        padding: '2px 6px',
                        borderRadius: 4,
                        background: 'rgba(100,181,246,0.15)',
                        color: '#64b5f6',
                      }}>
                        Verified
                      </span>
                    )}
                    <button
                      onClick={(e) => { e.stopPropagation(); openEditModal(ex.id); }}
                      style={{
                        padding: '3px 8px',
                        borderRadius: 4,
                        border: `1px solid ${borderColor}`,
                        background: 'transparent',
                        color: mutedColor,
                        fontSize: 11,
                        cursor: 'pointer',
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(ex.id, ex.name); }}
                      style={{
                        padding: '3px 8px',
                        borderRadius: 4,
                        border: '1px solid rgba(229,115,115,0.3)',
                        background: 'transparent',
                        color: '#e57373',
                        fontSize: 11,
                        cursor: 'pointer',
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
              {exercises.length === 0 && (
                <p style={{ color: mutedColor, fontSize: 13, textAlign: 'center', padding: 20 }}>
                  No exercises found
                </p>
              )}
            </div>
          )}
        </div>

        {/* Right: Detail panel */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {detail ? (
            <div style={{ background: cardBg, borderRadius: 12, padding: 24, border: `1px solid ${borderColor}` }}>
              <h2 style={{ fontSize: 18, fontWeight: 600, color: textColor, margin: 0 }}>
                {detail.name}
              </h2>
              <p style={{ fontSize: 12, color: mutedColor, marginTop: 4, marginBottom: 16 }}>
                {detail.equipment} · {detail.difficulty} · {detail.focusAreas.join(', ')}
              </p>

              <p style={{ fontSize: 13, color: 'rgba(246,237,221,0.7)', lineHeight: 1.5, marginBottom: 20 }}>
                {detail.description.length > 300 ? detail.description.slice(0, 300) + '...' : detail.description}
              </p>

              {/* Video URL */}
              <label style={labelStyle}>Video URL</label>
              <input
                type="text"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://youtube.com/watch?v=... or direct video URL"
                style={{ ...inputStyle, marginBottom: 16 }}
              />

              {/* Video preview */}
              {videoUrl && (
                <div style={{ marginBottom: 16 }}>
                  {videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be') ? (
                    <iframe
                      width="100%"
                      height="240"
                      src={videoUrl
                        .replace('watch?v=', 'embed/')
                        .replace('youtu.be/', 'youtube.com/embed/')}
                      style={{ borderRadius: 8, border: 'none' }}
                      allowFullScreen
                    />
                  ) : videoUrl.includes('vimeo.com') ? (
                    <iframe
                      width="100%"
                      height="240"
                      src={videoUrl.replace('vimeo.com/', 'player.vimeo.com/video/')}
                      style={{ borderRadius: 8, border: 'none' }}
                      allowFullScreen
                    />
                  ) : (
                    <video
                      src={videoUrl}
                      controls
                      style={{ width: '100%', maxHeight: 240, borderRadius: 8 }}
                    />
                  )}
                </div>
              )}

              {/* Image URL */}
              <label style={labelStyle}>Image URL</label>
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://..."
                style={{ ...inputStyle, marginBottom: 16 }}
              />

              {imageUrl && (
                <div style={{ marginBottom: 16 }}>
                  <img src={imageUrl} alt="" style={{ maxWidth: 200, borderRadius: 8 }} />
                </div>
              )}

              {/* Instructor Notes */}
              <label style={labelStyle}>Instructor Notes</label>
              <textarea
                value={instructorNotes}
                onChange={(e) => setInstructorNotes(e.target.value)}
                placeholder="Internal notes, review items..."
                rows={3}
                style={{
                  ...inputStyle,
                  marginBottom: 16,
                  resize: 'vertical',
                  fontFamily: 'inherit',
                }}
              />

              {/* Verified toggle */}
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', marginBottom: 20 }}>
                <input
                  type="checkbox"
                  checked={isVerified}
                  onChange={(e) => setIsVerified(e.target.checked)}
                  style={{ accentColor: '#81c784' }}
                />
                <span style={{ fontSize: 13, color: textColor }}>Instructor verified</span>
              </label>

              {/* Save */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  style={{
                    padding: '8px 24px',
                    borderRadius: 8,
                    border: 'none',
                    background: textColor,
                    color: '#1a1a1a',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: saving ? 'not-allowed' : 'pointer',
                    opacity: saving ? 0.5 : 1,
                  }}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                {message && (
                  <span style={{ fontSize: 13, color: message.includes('success') ? '#81c784' : '#e57373' }}>
                    {message}
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div style={{ padding: 40, textAlign: 'center', color: mutedColor, fontSize: 13 }}>
              Select an exercise to edit
            </div>
          )}
        </div>
      </div>

      {/* Floating Bulk Action Bar */}
      {selectedIds.size > 0 && (
        <div
          style={{
            position: 'fixed',
            bottom: '1.5rem',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(30, 30, 30, 0.95)',
            border: '1px solid rgba(246, 237, 221, 0.15)',
            borderRadius: '12px',
            padding: '0.75rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            zIndex: 100,
            backdropFilter: 'blur(12px)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
          }}
        >
          <span style={{ fontSize: '0.85rem', color: textColor, fontWeight: 500 }}>
            {selectedIds.size} selected
          </span>
          <button
            onClick={() => handleBulkAction('verify')}
            disabled={bulkVerifying}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              border: '1px solid rgba(100, 181, 246, 0.3)',
              background: 'rgba(100, 181, 246, 0.1)',
              color: '#64b5f6',
              fontSize: '0.8rem',
              fontWeight: 500,
              cursor: bulkVerifying ? 'not-allowed' : 'pointer',
              opacity: bulkVerifying ? 0.5 : 1,
            }}
          >
            Verify
          </button>
          <button
            onClick={() => handleBulkAction('delete')}
            disabled={bulkVerifying}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              border: '1px solid rgba(229, 115, 115, 0.3)',
              background: 'rgba(229, 115, 115, 0.1)',
              color: '#e57373',
              fontSize: '0.8rem',
              fontWeight: 500,
              cursor: bulkVerifying ? 'not-allowed' : 'pointer',
              opacity: bulkVerifying ? 0.5 : 1,
            }}
          >
            Delete
          </button>
          <button
            onClick={() => setSelectedIds(new Set())}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              border: '1px solid rgba(246, 237, 221, 0.1)',
              background: 'transparent',
              color: 'rgba(246, 237, 221, 0.5)',
              fontSize: '0.8rem',
              cursor: 'pointer',
            }}
          >
            Clear
          </button>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#1a1a1a',
              borderRadius: 16,
              border: `1px solid ${borderColor}`,
              padding: 32,
              width: 560,
              maxHeight: '85vh',
              overflowY: 'auto',
            }}
          >
            <h2 style={{ fontSize: 18, fontWeight: 600, color: textColor, margin: '0 0 20px' }}>
              {editingId ? 'Edit Exercise' : 'Create Exercise'}
            </h2>

            {/* Name */}
            <label style={labelStyle}>Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => {
                const name = e.target.value;
                setForm((prev) => ({
                  ...prev,
                  name,
                  slug: editingId ? prev.slug : slugify(name),
                }));
              }}
              style={{ ...inputStyle, marginBottom: 12 }}
            />

            {/* Slug */}
            <label style={labelStyle}>Slug *</label>
            <input
              type="text"
              value={form.slug}
              onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value }))}
              style={{ ...inputStyle, marginBottom: 12 }}
            />

            {/* Description */}
            <label style={labelStyle}>Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              rows={3}
              style={{ ...inputStyle, marginBottom: 12, resize: 'vertical', fontFamily: 'inherit' }}
            />

            {/* Equipment */}
            <label style={labelStyle}>Equipment *</label>
            <select
              value={form.equipment}
              onChange={(e) => setForm((prev) => ({ ...prev, equipment: e.target.value }))}
              style={{ ...inputStyle, marginBottom: 12 }}
            >
              {EQUIPMENT_OPTIONS.map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>

            {/* Difficulty */}
            <label style={labelStyle}>Difficulty *</label>
            <select
              value={form.difficulty}
              onChange={(e) => setForm((prev) => ({ ...prev, difficulty: e.target.value }))}
              style={{ ...inputStyle, marginBottom: 12 }}
            >
              {DIFFICULTY_OPTIONS.map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>

            {/* Focus Areas */}
            <label style={labelStyle}>Focus Areas</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
              {FOCUS_AREA_OPTIONS.map((area) => (
                <button
                  key={area}
                  type="button"
                  onClick={() => toggleFocusArea(area)}
                  style={{
                    padding: '4px 12px',
                    borderRadius: 16,
                    border: `1px solid ${form.focusAreas.includes(area) ? 'rgba(100,181,246,0.4)' : borderColor}`,
                    background: form.focusAreas.includes(area) ? 'rgba(100,181,246,0.15)' : 'transparent',
                    color: form.focusAreas.includes(area) ? '#64b5f6' : mutedColor,
                    fontSize: 12,
                    cursor: 'pointer',
                  }}
                >
                  {area}
                </button>
              ))}
            </div>

            {/* Sets, Reps, Tempo, RPE */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div>
                <label style={labelStyle}>Sets</label>
                <input
                  type="number"
                  min={1}
                  value={form.defaultSets}
                  onChange={(e) => setForm((prev) => ({ ...prev, defaultSets: parseInt(e.target.value) || 1 }))}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Reps</label>
                <input
                  type="text"
                  value={form.defaultReps}
                  onChange={(e) => setForm((prev) => ({ ...prev, defaultReps: e.target.value }))}
                  placeholder="e.g. 10"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Tempo</label>
                <input
                  type="text"
                  value={form.defaultTempo}
                  onChange={(e) => setForm((prev) => ({ ...prev, defaultTempo: e.target.value }))}
                  placeholder="e.g. 2-1-2"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>RPE (1-10)</label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={form.rpeTarget}
                  onChange={(e) => setForm((prev) => ({ ...prev, rpeTarget: parseInt(e.target.value) || 5 }))}
                  style={inputStyle}
                />
              </div>
            </div>

            {/* Cues */}
            <label style={labelStyle}>Cues (one per line)</label>
            <textarea
              value={form.cues}
              onChange={(e) => setForm((prev) => ({ ...prev, cues: e.target.value }))}
              rows={4}
              placeholder="Keep ribs connected&#10;Lengthen through the spine&#10;..."
              style={{ ...inputStyle, marginBottom: 12, resize: 'vertical', fontFamily: 'inherit' }}
            />

            {/* Image URL */}
            <label style={labelStyle}>Image URL</label>
            <input
              type="text"
              value={form.imageUrl}
              onChange={(e) => setForm((prev) => ({ ...prev, imageUrl: e.target.value }))}
              placeholder="https://..."
              style={{ ...inputStyle, marginBottom: 12 }}
            />

            {/* Video URL */}
            <label style={labelStyle}>Video URL</label>
            <input
              type="text"
              value={form.videoUrl}
              onChange={(e) => setForm((prev) => ({ ...prev, videoUrl: e.target.value }))}
              placeholder="https://..."
              style={{ ...inputStyle, marginBottom: 12 }}
            />

            {/* Instructor Notes */}
            <label style={labelStyle}>Instructor Notes</label>
            <textarea
              value={form.instructorNotes}
              onChange={(e) => setForm((prev) => ({ ...prev, instructorNotes: e.target.value }))}
              rows={2}
              style={{ ...inputStyle, marginBottom: 20, resize: 'vertical', fontFamily: 'inherit' }}
            />

            {/* Modal message */}
            {modalMessage && (
              <p style={{ fontSize: 13, color: '#e57373', marginBottom: 12 }}>{modalMessage}</p>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  padding: '8px 20px',
                  borderRadius: 8,
                  border: `1px solid ${borderColor}`,
                  background: 'transparent',
                  color: mutedColor,
                  fontSize: 13,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleModalSave}
                disabled={modalSaving}
                style={{
                  padding: '8px 24px',
                  borderRadius: 8,
                  border: 'none',
                  background: textColor,
                  color: '#1a1a1a',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: modalSaving ? 'not-allowed' : 'pointer',
                  opacity: modalSaving ? 0.5 : 1,
                }}
              >
                {modalSaving ? 'Saving...' : editingId ? 'Update Exercise' : 'Create Exercise'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
