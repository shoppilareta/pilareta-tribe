'use client';

import { useState, FormEvent } from 'react';
import type { Studio } from './hooks/useStudios';

interface SuggestEditFormProps {
  studio: Studio;
  onClose: () => void;
  onSuccess: () => void;
}

export function SuggestEditForm({ studio, onClose, onSuccess }: SuggestEditFormProps) {
  const [formData, setFormData] = useState({
    submitterEmail: '',
    name: studio.name,
    address: studio.formattedAddress || studio.address || '',
    phoneNumber: studio.phoneNumber || '',
    website: studio.website || '',
    reason: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Build suggested changes object with only changed fields
    const suggestedChanges: Record<string, string> = {};
    if (formData.name !== studio.name) suggestedChanges.name = formData.name;
    if (formData.address !== (studio.formattedAddress || studio.address || '')) {
      suggestedChanges.address = formData.address;
    }
    if (formData.phoneNumber !== (studio.phoneNumber || '')) {
      suggestedChanges.phoneNumber = formData.phoneNumber;
    }
    if (formData.website !== (studio.website || '')) {
      suggestedChanges.website = formData.website;
    }

    if (Object.keys(suggestedChanges).length === 0) {
      setError('Please make at least one change');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/studios/${studio.id}/suggest-edit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submitterEmail: formData.submitterEmail || undefined,
          suggestedChanges,
          reason: formData.reason || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit suggestion');
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '0.625rem 0.75rem',
    fontSize: '0.9375rem',
    background: 'rgba(246, 237, 221, 0.05)',
    border: '1px solid rgba(246, 237, 221, 0.15)',
    borderRadius: '0.375rem',
    color: '#f6eddd',
    outline: 'none',
  };

  const labelStyle = {
    display: 'block',
    fontSize: '0.875rem',
    fontWeight: 500,
    color: 'rgba(246, 237, 221, 0.8)',
    marginBottom: '0.375rem',
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 60,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
    >
      {/* Backdrop */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(4px)',
        }}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '28rem',
          maxHeight: 'calc(100vh - 2rem)',
          background: '#1a1a1a',
          borderRadius: '0.75rem',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '1rem 1.5rem',
            borderBottom: '1px solid rgba(246, 237, 221, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600, color: '#f6eddd' }}>
            Suggest an Edit
          </h3>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'rgba(246, 237, 221, 0.6)',
              cursor: 'pointer',
              padding: '0.25rem',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          style={{
            flex: 1,
            overflow: 'auto',
            padding: '1.5rem',
          }}
        >
          <p
            style={{
              margin: '0 0 1rem 0',
              fontSize: '0.875rem',
              color: 'rgba(246, 237, 221, 0.6)',
            }}
          >
            Help us keep information accurate. Edit the fields below with correct information.
          </p>

          {error && (
            <div
              style={{
                padding: '0.75rem 1rem',
                marginBottom: '1rem',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '0.375rem',
                color: '#ef4444',
                fontSize: '0.875rem',
              }}
            >
              {error}
            </div>
          )}

          <div style={{ marginBottom: '1rem' }}>
            <label style={labelStyle}>Studio Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={labelStyle}>Address</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={labelStyle}>Phone Number</label>
            <input
              type="tel"
              value={formData.phoneNumber}
              onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
              style={inputStyle}
              placeholder="Add phone number"
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={labelStyle}>Website</label>
            <input
              type="url"
              value={formData.website}
              onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
              style={inputStyle}
              placeholder="https://example.com"
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={labelStyle}>Your Email (optional)</label>
            <input
              type="email"
              value={formData.submitterEmail}
              onChange={(e) => setFormData(prev => ({ ...prev, submitterEmail: e.target.value }))}
              style={inputStyle}
              placeholder="To receive updates about your suggestion"
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={labelStyle}>Reason for changes (optional)</label>
            <textarea
              value={formData.reason}
              onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
              style={{ ...inputStyle, minHeight: '4rem', resize: 'vertical' }}
              placeholder="e.g., The phone number has changed..."
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.75rem 1.5rem',
              fontSize: '0.9375rem',
              fontWeight: 500,
              background: 'rgba(246, 237, 221, 0.15)',
              border: 'none',
              borderRadius: '0.375rem',
              color: '#f6eddd',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.5 : 1,
              transition: 'all 0.15s ease',
            }}
          >
            {loading ? 'Submitting...' : 'Submit Suggestion'}
          </button>
        </form>
      </div>
    </div>
  );
}
