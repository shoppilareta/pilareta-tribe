'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  createdAt: string;
}

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch('/api/user');
        if (!res.ok) {
          router.push('/api/auth/login');
          return;
        }
        const data = await res.json();
        setUser(data.user);
      } catch {
        router.push('/api/auth/login');
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, [router]);

  if (loading) {
    return (
      <div className="container" style={{ paddingTop: '3rem', paddingBottom: '3rem' }}>
        <div style={{ maxWidth: '28rem', margin: '0 auto' }}>
          <div className="card" style={{ animation: 'pulse 2s infinite' }}>
            <div style={{ height: '2rem', background: 'rgba(246, 237, 221, 0.1)', borderRadius: '0.25rem', marginBottom: '1rem', width: '50%' }} />
            <div style={{ height: '1rem', background: 'rgba(246, 237, 221, 0.1)', borderRadius: '0.25rem', marginBottom: '0.5rem', width: '75%' }} />
            <div style={{ height: '1rem', background: 'rgba(246, 237, 221, 0.1)', borderRadius: '0.25rem', width: '50%' }} />
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

        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 500, marginBottom: '1rem' }}>Profile</h2>

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
        </div>

        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 500, marginBottom: '1rem' }}>Quick Links</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <Link
              href="/studio-locator"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', borderRadius: '0.5rem', background: 'rgba(246, 237, 221, 0.05)' }}
            >
              <span>Find Studios</span>
              <svg style={{ width: '1rem', height: '1rem', opacity: 0.5 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            <Link
              href="/learn"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', borderRadius: '0.5rem', background: 'rgba(246, 237, 221, 0.05)' }}
            >
              <span>Learn Pilates</span>
              <svg style={{ width: '1rem', height: '1rem', opacity: 0.5 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            <Link
              href="/ugc"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', borderRadius: '0.5rem', background: 'rgba(246, 237, 221, 0.05)' }}
            >
              <span>Community</span>
              <svg style={{ width: '1rem', height: '1rem', opacity: 0.5 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
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
      </div>
    </div>
  );
}
