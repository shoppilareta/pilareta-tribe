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
      <div className="container py-12">
        <div className="max-w-md mx-auto">
          <div className="card animate-pulse">
            <div className="h-8 bg-[rgba(246,237,221,0.1)] rounded mb-4 w-1/2" />
            <div className="h-4 bg-[rgba(246,237,221,0.1)] rounded mb-2 w-3/4" />
            <div className="h-4 bg-[rgba(246,237,221,0.1)] rounded w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="container py-12">
      <div className="max-w-md mx-auto">
        <h1 className="mb-8">Your Account</h1>

        <div className="card mb-6">
          <h2 className="text-lg font-medium mb-4">Profile</h2>

          <div className="space-y-4">
            <div>
              <label className="text-xs text-muted uppercase tracking-wider">
                Email
              </label>
              <p className="mt-1">{user.email}</p>
            </div>

            {(user.firstName || user.lastName) && (
              <div>
                <label className="text-xs text-muted uppercase tracking-wider">
                  Name
                </label>
                <p className="mt-1">
                  {[user.firstName, user.lastName].filter(Boolean).join(' ')}
                </p>
              </div>
            )}

            <div>
              <label className="text-xs text-muted uppercase tracking-wider">
                Member Since
              </label>
              <p className="mt-1">
                {new Date(user.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>
        </div>

        <div className="card mb-6">
          <h2 className="text-lg font-medium mb-4">Quick Links</h2>
          <div className="space-y-2">
            <Link
              href="/studio-locator"
              className="flex items-center justify-between p-3 rounded-lg bg-[rgba(246,237,221,0.05)] hover:bg-[rgba(246,237,221,0.1)] transition-colors"
            >
              <span>Find Studios</span>
              <svg
                className="w-4 h-4 opacity-50"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
            <Link
              href="/learn"
              className="flex items-center justify-between p-3 rounded-lg bg-[rgba(246,237,221,0.05)] hover:bg-[rgba(246,237,221,0.1)] transition-colors"
            >
              <span>Learn Pilates</span>
              <svg
                className="w-4 h-4 opacity-50"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
            <Link
              href="/ugc"
              className="flex items-center justify-between p-3 rounded-lg bg-[rgba(246,237,221,0.05)] hover:bg-[rgba(246,237,221,0.1)] transition-colors"
            >
              <span>Community</span>
              <svg
                className="w-4 h-4 opacity-50"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          </div>
        </div>

        <a
          href="/api/auth/logout"
          className="btn btn-outline w-full"
        >
          Sign Out
        </a>
      </div>
    </div>
  );
}
