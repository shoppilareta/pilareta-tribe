'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TrackDashboard } from '@/components/track/TrackDashboard';
import { QuickLogModal } from '@/components/track/QuickLogModal';

interface UserSession {
  userId: string;
  firstName?: string;
}

export default function TrackPage() {
  const router = useRouter();
  const [session, setSession] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLogModal, setShowLogModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    async function checkAuth() {
      try {
        const response = await fetch('/api/user');
        if (response.ok) {
          const data = await response.json();
          if (data.user) {
            setSession({ userId: data.user.id, firstName: data.user.firstName });
          } else {
            router.push('/api/auth/login?redirect=/track');
          }
        } else {
          router.push('/api/auth/login?redirect=/track');
        }
      } catch {
        router.push('/api/auth/login?redirect=/track');
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, [router]);

  const handleLogComplete = () => {
    setShowLogModal(false);
    setRefreshKey((k) => k + 1);
  };

  if (loading) {
    return (
      <div className="container" style={{ paddingTop: '3rem', paddingBottom: '3rem' }}>
        <div style={{ maxWidth: '64rem', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ opacity: 0.6 }}>Loading...</div>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <>
      <TrackDashboard
        userId={session.userId}
        firstName={session.firstName}
        onLogWorkout={() => setShowLogModal(true)}
        refreshKey={refreshKey}
      />

      {showLogModal && (
        <QuickLogModal
          onClose={() => setShowLogModal(false)}
          onComplete={handleLogComplete}
        />
      )}
    </>
  );
}
