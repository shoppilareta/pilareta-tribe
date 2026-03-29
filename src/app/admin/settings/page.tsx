'use client';

import { useEffect, useState } from 'react';

interface SettingsData {
  config: Record<string, string>;
  health: {
    db: string;
    uptime: number;
    envVars: Record<string, boolean>;
  };
}

const textColor = '#f6eddd';
const mutedColor = 'rgba(246, 237, 221, 0.5)';
const cardBg = 'rgba(246, 237, 221, 0.03)';
const borderColor = 'rgba(246, 237, 221, 0.08)';

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  if (days > 0) return `${days}d ${hours}h ${mins}m`;
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
}

const GENERAL_KEYS = [
  { key: 'app_name', label: 'App Name', placeholder: 'Pilareta Tribe' },
  { key: 'support_email', label: 'Support Email', placeholder: 'support@pilareta.com' },
  { key: 'whatsapp_number', label: 'WhatsApp Number', placeholder: '+91...' },
];

const FEATURE_TOGGLES = [
  { key: 'feature_ugc', label: 'UGC Community' },
  { key: 'feature_shop', label: 'Shop' },
  { key: 'feature_studios', label: 'Studios' },
];

const INTEGRATION_LABELS: Record<string, string> = {
  SHOPIFY_STORE_DOMAIN: 'Shopify Store',
  SHOPIFY_STOREFRONT_TOKEN: 'Shopify Storefront',
  GOOGLE_MAPS_API_KEY: 'Google Maps',
  EXPO_ACCESS_TOKEN: 'Expo Push Notifications',
  DATABASE_URL: 'Database',
  SESSION_SECRET: 'Session Secret',
};

export default function AdminSettingsPage() {
  const [data, setData] = useState<SettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  // Editable general config
  const [editValues, setEditValues] = useState<Record<string, string>>({});
  // Editable feature toggles
  const [featureValues, setFeatureValues] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/settings');
      if (!res.ok) throw new Error('Failed to fetch settings');
      const result = await res.json();
      setData(result);

      // Populate edit values from config
      const edits: Record<string, string> = {};
      for (const gk of GENERAL_KEYS) {
        edits[gk.key] = result.config[gk.key] || '';
      }
      setEditValues(edits);

      // Populate feature toggles
      const features: Record<string, boolean> = {};
      for (const ft of FEATURE_TOGGLES) {
        features[ft.key] = result.config[ft.key] === 'true';
      }
      setFeatureValues(features);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    setSaveMessage('');
    try {
      const updates: Record<string, string> = { ...editValues };
      for (const ft of FEATURE_TOGGLES) {
        updates[ft.key] = featureValues[ft.key] ? 'true' : 'false';
      }

      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates }),
      });

      if (!res.ok) throw new Error('Failed to save');
      setSaveMessage('Settings saved successfully');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch {
      setSaveMessage('Failed to save settings');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ padding: '3rem 0', textAlign: 'center', color: mutedColor }}>
          Loading settings...
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ padding: '3rem 0', textAlign: 'center', color: '#e57373' }}>
          {error || 'Failed to load settings'}
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem' }}>
          <a
            href="/admin"
            style={{ color: mutedColor, textDecoration: 'none', fontSize: '0.875rem' }}
          >
            Admin
          </a>
          <span style={{ color: 'rgba(246, 237, 221, 0.3)' }}>/</span>
          <span style={{ color: 'rgba(246, 237, 221, 0.8)', fontSize: '0.875rem' }}>Settings</span>
        </div>
        <h1
          style={{
            margin: 0,
            fontSize: '1.5rem',
            fontWeight: 400,
            color: textColor,
            letterSpacing: '-0.02em',
          }}
        >
          System Settings
        </h1>
        <p style={{ margin: '0.25rem 0 0', fontSize: '0.875rem', color: mutedColor }}>
          Configure platform settings and view system health
        </p>
      </div>

      {/* General Settings */}
      <div
        style={{
          background: cardBg,
          border: `1px solid ${borderColor}`,
          borderRadius: '12px',
          padding: '1.25rem',
          marginBottom: '1.5rem',
        }}
      >
        <h2 style={{ margin: '0 0 1rem', fontSize: '0.9rem', fontWeight: 500, color: textColor }}>
          General
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {GENERAL_KEYS.map((gk) => (
            <div key={gk.key}>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.75rem',
                  color: mutedColor,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: '0.375rem',
                }}
              >
                {gk.label}
              </label>
              <input
                type="text"
                value={editValues[gk.key] || ''}
                onChange={(e) =>
                  setEditValues((prev) => ({ ...prev, [gk.key]: e.target.value }))
                }
                placeholder={gk.placeholder}
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  borderRadius: '8px',
                  border: `1px solid ${borderColor}`,
                  background: 'rgba(246, 237, 221, 0.02)',
                  color: textColor,
                  fontSize: '0.875rem',
                  outline: 'none',
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Feature Toggles */}
      <div
        style={{
          background: cardBg,
          border: `1px solid ${borderColor}`,
          borderRadius: '12px',
          padding: '1.25rem',
          marginBottom: '1.5rem',
        }}
      >
        <h2 style={{ margin: '0 0 1rem', fontSize: '0.9rem', fontWeight: 500, color: textColor }}>
          Feature Toggles
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {FEATURE_TOGGLES.map((ft) => (
            <label
              key={ft.key}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                cursor: 'pointer',
                padding: '0.5rem 0',
              }}
            >
              <input
                type="checkbox"
                checked={featureValues[ft.key] || false}
                onChange={(e) =>
                  setFeatureValues((prev) => ({ ...prev, [ft.key]: e.target.checked }))
                }
                style={{ accentColor: '#81c784', width: '16px', height: '16px' }}
              />
              <span style={{ fontSize: '0.875rem', color: textColor }}>{ft.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Save button */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            padding: '0.625rem 2rem',
            borderRadius: '8px',
            border: 'none',
            background: textColor,
            color: '#1a1a1a',
            fontSize: '0.875rem',
            fontWeight: 600,
            cursor: saving ? 'not-allowed' : 'pointer',
            opacity: saving ? 0.5 : 1,
          }}
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
        {saveMessage && (
          <span
            style={{
              fontSize: '0.85rem',
              color: saveMessage.includes('success') ? '#81c784' : '#e57373',
            }}
          >
            {saveMessage}
          </span>
        )}
      </div>

      {/* Integrations */}
      <div
        style={{
          background: cardBg,
          border: `1px solid ${borderColor}`,
          borderRadius: '12px',
          padding: '1.25rem',
          marginBottom: '1.5rem',
        }}
      >
        <h2 style={{ margin: '0 0 1rem', fontSize: '0.9rem', fontWeight: 500, color: textColor }}>
          Integrations
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {Object.entries(INTEGRATION_LABELS).map(([envKey, label]) => {
            const configured = data.health.envVars[envKey];
            return (
              <div
                key={envKey}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '0.5rem 0',
                  borderBottom: '1px solid rgba(246, 237, 221, 0.04)',
                }}
              >
                <div
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: configured ? '#81c784' : '#e57373',
                    flexShrink: 0,
                  }}
                />
                <span style={{ fontSize: '0.85rem', color: textColor, flex: 1 }}>{label}</span>
                <span
                  style={{
                    fontSize: '0.7rem',
                    color: configured ? 'rgba(129, 199, 132, 0.8)' : 'rgba(229, 115, 115, 0.8)',
                    textTransform: 'uppercase',
                    fontWeight: 500,
                  }}
                >
                  {configured ? 'Configured' : 'Not Set'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* System Health */}
      <div
        style={{
          background: cardBg,
          border: `1px solid ${borderColor}`,
          borderRadius: '12px',
          padding: '1.25rem',
          marginBottom: '2rem',
        }}
      >
        <h2 style={{ margin: '0 0 1rem', fontSize: '0.9rem', fontWeight: 500, color: textColor }}>
          System Health
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '1rem',
          }}
        >
          {/* DB Status */}
          <div
            style={{
              padding: '1rem',
              borderRadius: '8px',
              background: 'rgba(246, 237, 221, 0.02)',
              border: `1px solid ${borderColor}`,
            }}
          >
            <div
              style={{
                fontSize: '0.7rem',
                color: mutedColor,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '0.375rem',
              }}
            >
              Database
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <div
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: data.health.db === 'ok' ? '#81c784' : '#e57373',
                }}
              />
              <span
                style={{
                  fontSize: '0.9rem',
                  fontWeight: 500,
                  color: data.health.db === 'ok' ? '#81c784' : '#e57373',
                }}
              >
                {data.health.db === 'ok' ? 'Connected' : 'Error'}
              </span>
            </div>
          </div>

          {/* Uptime */}
          <div
            style={{
              padding: '1rem',
              borderRadius: '8px',
              background: 'rgba(246, 237, 221, 0.02)',
              border: `1px solid ${borderColor}`,
            }}
          >
            <div
              style={{
                fontSize: '0.7rem',
                color: mutedColor,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '0.375rem',
              }}
            >
              Server Uptime
            </div>
            <div
              style={{
                fontSize: '1.1rem',
                fontWeight: 300,
                color: textColor,
              }}
            >
              {formatUptime(data.health.uptime)}
            </div>
          </div>

          {/* Node Environment */}
          <div
            style={{
              padding: '1rem',
              borderRadius: '8px',
              background: 'rgba(246, 237, 221, 0.02)',
              border: `1px solid ${borderColor}`,
            }}
          >
            <div
              style={{
                fontSize: '0.7rem',
                color: mutedColor,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '0.375rem',
              }}
            >
              Environment
            </div>
            <div
              style={{
                fontSize: '1.1rem',
                fontWeight: 300,
                color: textColor,
              }}
            >
              {typeof window !== 'undefined' ? (window.location.hostname === 'localhost' ? 'Development' : 'Production') : 'N/A'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
