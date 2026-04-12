'use client';

import { adminFetch } from '@/lib/admin-fetch';
import { useEffect, useState, useCallback } from 'react';

interface Banner {
  id: string;
  title: string;
  subtitle: string | null;
  imageUrl: string;
  linkUrl: string | null;
  linkText: string | null;
  position: number;
  isActive: boolean;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  updatedAt: string;
}

interface BannerFormData {
  title: string;
  subtitle: string;
  imageUrl: string;
  linkUrl: string;
  linkText: string;
  position: number;
  isActive: boolean;
  startDate: string;
  endDate: string;
}

const emptyForm: BannerFormData = {
  title: '',
  subtitle: '',
  imageUrl: '',
  linkUrl: '',
  linkText: '',
  position: 0,
  isActive: true,
  startDate: '',
  endDate: '',
};

export default function AdminShopPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<BannerFormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchBanners = useCallback(async () => {
    try {
      const res = await adminFetch('/api/admin/banners');
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setBanners(data.banners);
    } catch {
      // Silently handle error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  const openCreateForm = () => {
    setEditingId(null);
    setForm({ ...emptyForm, position: banners.length });
    setShowForm(true);
  };

  const openEditForm = (banner: Banner) => {
    setEditingId(banner.id);
    setForm({
      title: banner.title,
      subtitle: banner.subtitle || '',
      imageUrl: banner.imageUrl,
      linkUrl: banner.linkUrl || '',
      linkText: banner.linkText || '',
      position: banner.position,
      isActive: banner.isActive,
      startDate: banner.startDate ? banner.startDate.split('T')[0] : '',
      endDate: banner.endDate ? banner.endDate.split('T')[0] : '',
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.imageUrl) {
      alert('Title and Image URL are required');
      return;
    }
    setSaving(true);
    try {
      const body = {
        title: form.title,
        subtitle: form.subtitle || null,
        imageUrl: form.imageUrl,
        linkUrl: form.linkUrl || null,
        linkText: form.linkText || null,
        position: form.position,
        isActive: form.isActive,
        startDate: form.startDate || null,
        endDate: form.endDate || null,
      };

      const res = editingId
        ? await adminFetch(`/api/admin/banners/${editingId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          })
        : await adminFetch('/api/admin/banners', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          });

      if (!res.ok) throw new Error('Failed to save');
      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);
      await fetchBanners();
    } catch {
      alert('Failed to save banner');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this banner?')) return;
    setDeleting(id);
    try {
      const res = await adminFetch(`/api/admin/banners/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed');
      await fetchBanners();
    } catch {
      alert('Failed to delete banner');
    } finally {
      setDeleting(null);
    }
  };

  const toggleActive = async (banner: Banner) => {
    try {
      const res = await adminFetch(`/api/admin/banners/${banner.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !banner.isActive }),
      });
      if (!res.ok) throw new Error('Failed');
      await fetchBanners();
    } catch {
      alert('Failed to toggle banner');
    }
  };

  const movePosition = async (banner: Banner, direction: 'up' | 'down') => {
    const idx = banners.findIndex((b) => b.id === banner.id);
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= banners.length) return;

    const swapBanner = banners[swapIdx];
    try {
      await Promise.all([
        fetch(`/api/admin/banners/${banner.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ position: swapBanner.position }),
        }),
        fetch(`/api/admin/banners/${swapBanner.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ position: banner.position }),
        }),
      ]);
      await fetchBanners();
    } catch {
      alert('Failed to reorder');
    }
  };

  const cardStyle: React.CSSProperties = {
    background: 'rgba(246, 237, 221, 0.03)',
    border: '1px solid rgba(246, 237, 221, 0.08)',
    borderRadius: '12px',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.625rem 0.75rem',
    borderRadius: '8px',
    border: '1px solid rgba(246, 237, 221, 0.12)',
    background: 'rgba(246, 237, 221, 0.04)',
    color: '#f6eddd',
    fontSize: '0.875rem',
    outline: 'none',
    boxSizing: 'border-box',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '0.75rem',
    fontWeight: 500,
    color: 'rgba(246, 237, 221, 0.6)',
    marginBottom: '0.375rem',
    textTransform: 'uppercase',
    letterSpacing: '0.03em',
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem' }}>
          <a href="/admin" style={{ color: 'rgba(246, 237, 221, 0.5)', textDecoration: 'none', fontSize: '0.875rem' }}>
            Admin
          </a>
          <span style={{ color: 'rgba(246, 237, 221, 0.3)' }}>/</span>
          <span style={{ color: 'rgba(246, 237, 221, 0.8)', fontSize: '0.875rem' }}>Shop Banners</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 400, color: '#f6eddd', letterSpacing: '-0.02em' }}>
              Banner Management
            </h1>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.875rem', color: 'rgba(246, 237, 221, 0.5)' }}>
              Manage shop promotional banners
            </p>
          </div>
          <button
            onClick={openCreateForm}
            style={{
              padding: '0.625rem 1.25rem',
              borderRadius: '8px',
              border: '1px solid rgba(246, 237, 221, 0.2)',
              background: 'rgba(246, 237, 221, 0.08)',
              color: '#f6eddd',
              fontSize: '0.85rem',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            + Add Banner
          </button>
        </div>
      </div>

      {/* Create/Edit Form */}
      {showForm && (
        <div style={{ ...cardStyle, padding: '1.5rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 500, color: '#f6eddd' }}>
              {editingId ? 'Edit Banner' : 'Create Banner'}
            </h2>
            <button
              onClick={() => { setShowForm(false); setEditingId(null); setForm(emptyForm); }}
              style={{ background: 'none', border: 'none', color: 'rgba(246, 237, 221, 0.4)', cursor: 'pointer', fontSize: '1.2rem' }}
            >
              x
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={labelStyle}>Title *</label>
              <input
                style={inputStyle}
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="Banner title"
              />
            </div>
            <div>
              <label style={labelStyle}>Subtitle</label>
              <input
                style={inputStyle}
                value={form.subtitle}
                onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))}
                placeholder="Optional subtitle"
              />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Image URL *</label>
              <input
                style={inputStyle}
                value={form.imageUrl}
                onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
                placeholder="https://..."
              />
            </div>
            <div>
              <label style={labelStyle}>Link URL</label>
              <input
                style={inputStyle}
                value={form.linkUrl}
                onChange={(e) => setForm((f) => ({ ...f, linkUrl: e.target.value }))}
                placeholder="https://..."
              />
            </div>
            <div>
              <label style={labelStyle}>Link Text</label>
              <input
                style={inputStyle}
                value={form.linkText}
                onChange={(e) => setForm((f) => ({ ...f, linkText: e.target.value }))}
                placeholder="Shop Now"
              />
            </div>
            <div>
              <label style={labelStyle}>Position</label>
              <input
                style={inputStyle}
                type="number"
                value={form.position}
                onChange={(e) => setForm((f) => ({ ...f, position: parseInt(e.target.value) || 0 }))}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.75rem' }}>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.85rem',
                  color: '#f6eddd',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                  style={{ accentColor: '#81c784' }}
                />
                Active
              </label>
            </div>
            <div>
              <label style={labelStyle}>Start Date</label>
              <input
                style={{ ...inputStyle, colorScheme: 'dark' }}
                type="date"
                value={form.startDate}
                onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
              />
            </div>
            <div>
              <label style={labelStyle}>End Date</label>
              <input
                style={{ ...inputStyle, colorScheme: 'dark' }}
                type="date"
                value={form.endDate}
                onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
            <button
              onClick={() => { setShowForm(false); setEditingId(null); setForm(emptyForm); }}
              style={{
                padding: '0.625rem 1.25rem',
                borderRadius: '8px',
                border: '1px solid rgba(246, 237, 221, 0.1)',
                background: 'transparent',
                color: 'rgba(246, 237, 221, 0.6)',
                fontSize: '0.85rem',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                padding: '0.625rem 1.5rem',
                borderRadius: '8px',
                border: '1px solid rgba(246, 237, 221, 0.2)',
                background: 'rgba(246, 237, 221, 0.1)',
                color: '#f6eddd',
                fontSize: '0.85rem',
                fontWeight: 500,
                cursor: saving ? 'not-allowed' : 'pointer',
                opacity: saving ? 0.5 : 1,
              }}
            >
              {saving ? 'Saving...' : editingId ? 'Update Banner' : 'Create Banner'}
            </button>
          </div>
        </div>
      )}

      {/* Banner List */}
      <div style={cardStyle}>
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'rgba(246, 237, 221, 0.5)' }}>
            Loading banners...
          </div>
        ) : banners.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center' }}>
            <div style={{ fontSize: '0.9rem', color: 'rgba(246, 237, 221, 0.5)', marginBottom: '1rem' }}>
              No banners yet
            </div>
            <button
              onClick={openCreateForm}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                border: '1px solid rgba(246, 237, 221, 0.15)',
                background: 'rgba(246, 237, 221, 0.05)',
                color: 'rgba(246, 237, 221, 0.7)',
                fontSize: '0.85rem',
                cursor: 'pointer',
              }}
            >
              Create your first banner
            </button>
          </div>
        ) : (
          banners.map((banner, idx) => (
            <div
              key={banner.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '1rem 1.25rem',
                borderBottom: idx < banners.length - 1 ? '1px solid rgba(246, 237, 221, 0.06)' : 'none',
              }}
            >
              {/* Position controls */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flexShrink: 0 }}>
                <button
                  onClick={() => movePosition(banner, 'up')}
                  disabled={idx === 0}
                  style={{
                    width: '24px',
                    height: '20px',
                    background: 'none',
                    border: '1px solid rgba(246, 237, 221, 0.1)',
                    borderRadius: '4px',
                    color: idx === 0 ? 'rgba(246, 237, 221, 0.15)' : 'rgba(246, 237, 221, 0.5)',
                    cursor: idx === 0 ? 'not-allowed' : 'pointer',
                    fontSize: '0.7rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 0,
                  }}
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="18 15 12 9 6 15" />
                  </svg>
                </button>
                <button
                  onClick={() => movePosition(banner, 'down')}
                  disabled={idx === banners.length - 1}
                  style={{
                    width: '24px',
                    height: '20px',
                    background: 'none',
                    border: '1px solid rgba(246, 237, 221, 0.1)',
                    borderRadius: '4px',
                    color: idx === banners.length - 1 ? 'rgba(246, 237, 221, 0.15)' : 'rgba(246, 237, 221, 0.5)',
                    cursor: idx === banners.length - 1 ? 'not-allowed' : 'pointer',
                    fontSize: '0.7rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 0,
                  }}
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
              </div>

              {/* Image preview */}
              <div
                style={{
                  width: '80px',
                  height: '48px',
                  borderRadius: '6px',
                  overflow: 'hidden',
                  flexShrink: 0,
                  background: 'rgba(246, 237, 221, 0.05)',
                  border: '1px solid rgba(246, 237, 221, 0.06)',
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={banner.imageUrl}
                  alt={banner.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.9rem', fontWeight: 500, color: '#f6eddd' }}>
                    {banner.title}
                  </span>
                  <span
                    style={{
                      fontSize: '0.6rem',
                      fontWeight: 600,
                      padding: '2px 6px',
                      borderRadius: '4px',
                      textTransform: 'uppercase',
                      ...(banner.isActive
                        ? { background: 'rgba(76, 175, 80, 0.15)', color: '#81c784' }
                        : { background: 'rgba(255, 183, 77, 0.15)', color: '#ffb74d' }),
                    }}
                  >
                    {banner.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                {banner.subtitle && (
                  <div style={{ fontSize: '0.8rem', color: 'rgba(246, 237, 221, 0.5)', marginTop: '0.125rem' }}>
                    {banner.subtitle}
                  </div>
                )}
                <div style={{ fontSize: '0.7rem', color: 'rgba(246, 237, 221, 0.35)', marginTop: '0.25rem' }}>
                  Position: {banner.position}
                  {banner.linkUrl && ` | Links to: ${banner.linkUrl}`}
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                <button
                  onClick={() => toggleActive(banner)}
                  title={banner.isActive ? 'Deactivate' : 'Activate'}
                  style={{
                    padding: '0.4rem 0.75rem',
                    borderRadius: '6px',
                    border: '1px solid rgba(246, 237, 221, 0.1)',
                    background: 'transparent',
                    color: 'rgba(246, 237, 221, 0.6)',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                  }}
                >
                  {banner.isActive ? 'Deactivate' : 'Activate'}
                </button>
                <button
                  onClick={() => openEditForm(banner)}
                  style={{
                    padding: '0.4rem 0.75rem',
                    borderRadius: '6px',
                    border: '1px solid rgba(246, 237, 221, 0.1)',
                    background: 'transparent',
                    color: 'rgba(246, 237, 221, 0.6)',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                  }}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(banner.id)}
                  disabled={deleting === banner.id}
                  style={{
                    padding: '0.4rem 0.75rem',
                    borderRadius: '6px',
                    border: '1px solid rgba(229, 115, 115, 0.2)',
                    background: 'transparent',
                    color: '#e57373',
                    fontSize: '0.75rem',
                    cursor: deleting === banner.id ? 'not-allowed' : 'pointer',
                    opacity: deleting === banner.id ? 0.5 : 1,
                  }}
                >
                  {deleting === banner.id ? '...' : 'Delete'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
