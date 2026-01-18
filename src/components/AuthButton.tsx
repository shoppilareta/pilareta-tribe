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
      <div className="w-20 h-9 bg-[rgba(246,237,221,0.1)] rounded-full animate-pulse" />
    );
  }

  if (user) {
    return (
      <Link
        href="/account"
        className="btn btn-outline text-xs px-4 py-2"
      >
        Account
      </Link>
    );
  }

  return (
    <Link
      href="/api/auth/login"
      className="btn btn-primary text-xs px-4 py-2"
    >
      Sign In
    </Link>
  );
}
