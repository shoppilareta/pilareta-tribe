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
  videoUrl: string | null;
  imageUrl: string | null;
  videoTimestamps: unknown;
  multiAngleVideos: unknown;
  isVerified: boolean;
  instructorNotes: string | null;
}

const textColor = '#f6eddd';
const mutedColor = 'rgba(246,237,221,0.5)';
const cardBg = 'rgba(246,237,221,0.03)';
const borderColor = 'rgba(246,237,221,0.08)';

export default function ExercisesAdminPage() {
  const [exercises, setExercises] = useState<ExerciseSummary[]>([]);
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<ExerciseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  // Editable fields
  const [videoUrl, setVideoUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [instructorNotes, setInstructorNotes] = useState('');
  const [isVerified, setIsVerified] = useState(false);

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
        fetchExercises(); // Refresh list
      } else {
        setMessage('Failed to save');
      }
    } catch {
      setMessage('Failed to save');
    } finally {
      setSaving(false);
    }
  }

  const hasVideo = (e: ExerciseSummary) => !!e.videoUrl;

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, color: textColor, margin: 0 }}>
          Exercises
        </h1>
        <p style={{ fontSize: 13, color: mutedColor, marginTop: 4 }}>
          Manage exercise videos and media
        </p>
      </div>

      <div style={{ display: 'flex', gap: 24 }}>
        {/* Left: Exercise list */}
        <div style={{ width: 380, flexShrink: 0 }}>
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

          {loading ? (
            <p style={{ color: mutedColor, fontSize: 13 }}>Loading...</p>
          ) : (
            <div style={{ maxHeight: 'calc(100vh - 220px)', overflowY: 'auto' }}>
              {exercises.map((ex) => (
                <div
                  key={ex.id}
                  onClick={() => setSelectedId(ex.id)}
                  style={{
                    padding: '10px 12px',
                    borderRadius: 8,
                    cursor: 'pointer',
                    background: selectedId === ex.id ? 'rgba(246,237,221,0.08)' : 'transparent',
                    marginBottom: 2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: textColor, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {ex.name}
                    </div>
                    <div style={{ fontSize: 11, color: mutedColor, marginTop: 2 }}>
                      {ex.equipment} · {ex.difficulty}
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
              <label style={{ display: 'block', fontSize: 11, color: mutedColor, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>
                Video URL
              </label>
              <input
                type="text"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://youtube.com/watch?v=... or direct video URL"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 8,
                  border: `1px solid ${borderColor}`,
                  background: 'rgba(246,237,221,0.02)',
                  color: textColor,
                  fontSize: 13,
                  marginBottom: 16,
                  outline: 'none',
                }}
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
              <label style={{ display: 'block', fontSize: 11, color: mutedColor, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>
                Image URL
              </label>
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://..."
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 8,
                  border: `1px solid ${borderColor}`,
                  background: 'rgba(246,237,221,0.02)',
                  color: textColor,
                  fontSize: 13,
                  marginBottom: 16,
                  outline: 'none',
                }}
              />

              {imageUrl && (
                <div style={{ marginBottom: 16 }}>
                  <img src={imageUrl} alt="" style={{ maxWidth: 200, borderRadius: 8 }} />
                </div>
              )}

              {/* Instructor Notes */}
              <label style={{ display: 'block', fontSize: 11, color: mutedColor, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>
                Instructor Notes
              </label>
              <textarea
                value={instructorNotes}
                onChange={(e) => setInstructorNotes(e.target.value)}
                placeholder="Internal notes, review items..."
                rows={3}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 8,
                  border: `1px solid ${borderColor}`,
                  background: 'rgba(246,237,221,0.02)',
                  color: textColor,
                  fontSize: 13,
                  marginBottom: 16,
                  outline: 'none',
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
    </div>
  );
}
