'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Footer } from '@/components/Footer';

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  createdAt: string;
}

const chevronIcon = (
  <svg style={{ width: '1rem', height: '1rem', opacity: 0.5 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Profile editing
  const [editing, setEditing] = useState(false);
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const fetchUser = useCallback(async () => {
    setError(null);
    try {
      const res = await fetch('/api/user');
      if (res.status === 401) {
        router.push('/api/auth/login');
        return;
      }
      if (!res.ok) throw new Error('Failed to load account');
      const data = await res.json();
      setUser(data.user);
      setEditFirstName(data.user.firstName || '');
      setEditLastName(data.user.lastName || '');
    } catch (err) {
      if (err instanceof Error && err.message === 'Failed to load account') {
        setError('Could not load your account. Please try again.');
      } else {
        router.push('/api/auth/login');
      }
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const handleSaveProfile = async () => {
    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);
    try {
      const res = await fetch('/api/user', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: editFirstName.trim(),
          lastName: editLastName.trim(),
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to save');
      }
      const data = await res.json();
      setUser(data.user);
      setEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Could not save changes.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ paddingTop: '3rem', paddingBottom: '3rem' }}>
        <div style={{ maxWidth: '28rem', margin: '0 auto' }}>
          <div className="skeleton" style={{ width: '10rem', height: '2rem', marginBottom: '2rem' }} />
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div className="skeleton" style={{ width: '4rem', height: '1.125rem', marginBottom: '1rem' }} />
            <div className="skeleton" style={{ width: '75%', height: '0.875rem', marginBottom: '1rem' }} />
            <div className="skeleton" style={{ width: '60%', height: '0.875rem', marginBottom: '1rem' }} />
            <div className="skeleton" style={{ width: '50%', height: '0.875rem' }} />
          </div>
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div className="skeleton" style={{ width: '6rem', height: '1.125rem', marginBottom: '1rem' }} />
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="skeleton" style={{ width: '100%', height: '2.75rem', borderRadius: '0.5rem', marginBottom: '0.5rem' }} />
            ))}
          </div>
          <div className="skeleton" style={{ width: '100%', height: '2.75rem', borderRadius: '9999px' }} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container" style={{ paddingTop: '3rem', paddingBottom: '3rem' }}>
        <div style={{ maxWidth: '28rem', margin: '0 auto' }}>
          <div className="error-banner">
            <span>{error}</span>
            <button onClick={fetchUser}>Retry</button>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="container" style={{ paddingTop: '3rem', paddingBottom: '3rem' }}>
      <div style={{ maxWidth: '28rem', margin: '0 auto' }}>
        <h1 style={{ marginBottom: '2rem' }}>Your Account</h1>

        {/* Save success message */}
        {saveSuccess && (
          <div style={{
            padding: '0.75rem 1rem',
            background: 'rgba(34, 197, 94, 0.1)',
            border: '1px solid rgba(34, 197, 94, 0.2)',
            borderRadius: '0.5rem',
            color: '#22c55e',
            fontSize: '0.875rem',
            marginBottom: '1rem',
          }}>
            Profile updated successfully.
          </div>
        )}

        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 500, margin: 0 }}>Profile</h2>
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                style={{
                  background: 'rgba(246, 237, 221, 0.1)',
                  border: 'none',
                  borderRadius: '0.375rem',
                  color: '#f6eddd',
                  padding: '0.375rem 0.75rem',
                  fontSize: '0.8125rem',
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                }}
              >
                Edit
              </button>
            )}
          </div>

          {editing ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'rgba(246, 237, 221, 0.6)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.375rem' }}>
                  First Name
                </label>
                <input
                  type="text"
                  value={editFirstName}
                  onChange={(e) => setEditFirstName(e.target.value)}
                  placeholder="Your first name"
                  style={{ width: '100%' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'rgba(246, 237, 221, 0.6)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.375rem' }}>
                  Last Name
                </label>
                <input
                  type="text"
                  value={editLastName}
                  onChange={(e) => setEditLastName(e.target.value)}
                  placeholder="Your last name"
                  style={{ width: '100%' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'rgba(246, 237, 221, 0.6)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Email
                </label>
                <p style={{ marginTop: '0.25rem', opacity: 0.7 }}>{user.email}</p>
                <p style={{ fontSize: '0.75rem', color: 'rgba(246, 237, 221, 0.4)', marginTop: '0.25rem' }}>
                  Email is managed through your Pilareta account
                </p>
              </div>

              {saveError && (
                <p className="field-error">{saveError}</p>
              )}

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="btn btn-primary"
                  style={{ flex: 1, padding: '0.625rem', fontSize: '0.875rem', opacity: saving ? 0.6 : 1 }}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  onClick={() => {
                    setEditing(false);
                    setEditFirstName(user.firstName || '');
                    setEditLastName(user.lastName || '');
                    setSaveError(null);
                  }}
                  className="btn btn-outline"
                  style={{ padding: '0.625rem 1rem', fontSize: '0.875rem' }}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'rgba(246, 237, 221, 0.6)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Email
                </label>
                <p style={{ marginTop: '0.25rem' }}>{user.email}</p>
              </div>

              {(user.firstName || user.lastName) && (
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'rgba(246, 237, 221, 0.6)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Name
                  </label>
                  <p style={{ marginTop: '0.25rem' }}>
                    {[user.firstName, user.lastName].filter(Boolean).join(' ')}
                  </p>
                </div>
              )}

              <div>
                <label style={{ fontSize: '0.75rem', color: 'rgba(246, 237, 221, 0.6)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Member Since
                </label>
                <p style={{ marginTop: '0.25rem' }}>
                  {new Date(user.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 500, marginBottom: '1rem' }}>Quick Links</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <Link href="/account/orders" className="quick-link">
              <span>Order History</span>
              {chevronIcon}
            </Link>
            <Link href="/track" className="quick-link">
              <span>Workout Tracker</span>
              {chevronIcon}
            </Link>
            <Link href="/studio-locator" className="quick-link">
              <span>Find Studios</span>
              {chevronIcon}
            </Link>
            <Link href="/learn" className="quick-link">
              <span>Learn Pilates</span>
              {chevronIcon}
            </Link>
            <Link href="/community" className="quick-link">
              <span>Community</span>
              {chevronIcon}
            </Link>
          </div>
        </div>

        <a
          href="/api/auth/logout"
          className="btn btn-outline"
          style={{ width: '100%' }}
        >
          Sign Out
        </a>

        <Footer />
      </div>
    </div>
  );
}
