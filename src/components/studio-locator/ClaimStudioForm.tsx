'use client';

import { useState, FormEvent } from 'react';
import type { Studio } from './hooks/useStudios';

interface ClaimStudioFormProps {
  studio: Studio;
  onClose: () => void;
  onSuccess: () => void;
}

export function ClaimStudioForm({ studio, onClose, onSuccess }: ClaimStudioFormProps) {
  const [formData, setFormData] = useState({
    claimantName: '',
    claimantEmail: '',
    claimantPhone: '',
    businessRole: '',
    proofDescription: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/studios/${studio.id}/claim`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit claim');
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
            Claim {studio.name}
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
            <label style={labelStyle}>Your Name *</label>
            <input
              type="text"
              required
              value={formData.claimantName}
              onChange={(e) => setFormData(prev => ({ ...prev, claimantName: e.target.value }))}
              style={inputStyle}
              placeholder="John Smith"
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={labelStyle}>Email *</label>
            <input
              type="email"
              required
              value={formData.claimantEmail}
              onChange={(e) => setFormData(prev => ({ ...prev, claimantEmail: e.target.value }))}
              style={inputStyle}
              placeholder="john@example.com"
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={labelStyle}>Phone (optional)</label>
            <input
              type="tel"
              value={formData.claimantPhone}
              onChange={(e) => setFormData(prev => ({ ...prev, claimantPhone: e.target.value }))}
              style={inputStyle}
              placeholder="+1 234 567 8900"
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={labelStyle}>Your Role *</label>
            <select
              required
              value={formData.businessRole}
              onChange={(e) => setFormData(prev => ({ ...prev, businessRole: e.target.value }))}
              style={{ ...inputStyle, cursor: 'pointer' }}
            >
              <option value="">Select your role...</option>
              <option value="owner">Owner</option>
              <option value="manager">Manager</option>
              <option value="employee">Employee</option>
            </select>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={labelStyle}>How can you prove ownership? (optional)</label>
            <textarea
              value={formData.proofDescription}
              onChange={(e) => setFormData(prev => ({ ...prev, proofDescription: e.target.value }))}
              style={{ ...inputStyle, minHeight: '5rem', resize: 'vertical' }}
              placeholder="e.g., I can provide business registration documents, utility bills with the studio address..."
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
            {loading ? 'Submitting...' : 'Submit Claim'}
          </button>
        </form>
      </div>
    </div>
  );
}
