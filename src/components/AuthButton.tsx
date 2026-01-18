'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
}

export function AuthButton() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/user');
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        }
      } catch {
        // Not logged in
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, []);

  if (loading) {
    return (
      <div className="w-16 h-5 bg-[rgba(246,237,221,0.1)] rounded animate-pulse" />
    );
  }

  if (user) {
    return (
      <div className="flex items-center gap-6">
        <Link
          href="/account"
          className="text-sm tracking-wide opacity-70 hover:opacity-100 transition-opacity flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span className="hidden sm:inline">Account</span>
        </Link>
      </div>
    );
  }

  return (
    <Link
      href="/api/auth/login"
      className="text-sm tracking-wide opacity-70 hover:opacity-100 transition-opacity flex items-center gap-2"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
      <span className="hidden sm:inline">Sign In</span>
    </Link>
  );
}
