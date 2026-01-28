'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { StatsOverview } from './StatsOverview';
import { StreakDisplay } from './StreakDisplay';
import { WeeklyProgress } from './WeeklyProgress';
import { RecentLogs } from './RecentLogs';
import { CalendarView } from './CalendarView';
import { FocusBalanceChart } from './FocusBalanceChart';

interface WorkoutStats {
  currentStreak: number;
  longestStreak: number;
  lastWorkoutDate: string | null;
  streakStartDate: string | null;
  totalWorkouts: number;
  totalMinutes: number;
  weeklyMinutes: number;
  monthlyMinutes: number;
  focusAreaCounts: Record<string, number>;
  totalCalories: number;
  averageRpe: number | null;
  workoutTypeBreakdown: Record<string, number>;
}

interface TrackDashboardProps {
  userId: string;
  firstName?: string;
  onLogWorkout: () => void;
  refreshKey: number;
  onRefresh?: () => void;
}

export function TrackDashboard({ firstName, onLogWorkout, refreshKey, onRefresh }: TrackDashboardProps) {
  const [stats, setStats] = useState<WorkoutStats | null>(null);
  const [weeklyProgress, setWeeklyProgress] = useState<boolean[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'calendar'>('overview');

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch('/api/track/stats');
        if (response.ok) {
          const data = await response.json();
          setStats(data.stats);
          setWeeklyProgress(data.weeklyProgress);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, [refreshKey]);

  const greeting = firstName ? `${firstName}'s ` : 'Your ';

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '3rem' }}>
      <div style={{ maxWidth: '64rem', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', marginBottom: '0.5rem' }}>
                {greeting}Workout Tracker
              </h1>
              <p style={{ color: 'rgba(246, 237, 221, 0.6)', maxWidth: '32rem' }}>
                Log your workouts, track your streak, and see your progress over time.
              </p>
            </div>
            <button
              onClick={onLogWorkout}
              className="btn btn-primary"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '1rem',
                padding: '0.75rem 1.5rem'
              }}
            >
              <svg style={{ width: '1.25rem', height: '1.25rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Log Workout
            </button>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', opacity: 0.6 }}>
            Loading your stats...
          </div>
        ) : stats ? (
          <>
            {/* Streak + Weekly Progress */}
            <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', marginBottom: '1.5rem' }}>
              <StreakDisplay
                currentStreak={stats.currentStreak}
                longestStreak={stats.longestStreak}
                lastWorkoutDate={stats.lastWorkoutDate}
              />
              <WeeklyProgress progress={weeklyProgress} />
            </div>

            {/* Stats Overview */}
            <StatsOverview
              totalWorkouts={stats.totalWorkouts}
              totalMinutes={stats.totalMinutes}
              weeklyMinutes={stats.weeklyMinutes}
              monthlyMinutes={stats.monthlyMinutes}
              totalCalories={stats.totalCalories}
              averageRpe={stats.averageRpe}
            />

            {/* Tab Navigation */}
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '2rem', marginBottom: '1rem', borderBottom: '1px solid rgba(246, 237, 221, 0.1)', paddingBottom: '0.5rem' }}>
              <button
                onClick={() => setActiveTab('overview')}
                style={{
                  padding: '0.5rem 1rem',
                  background: activeTab === 'overview' ? 'rgba(246, 237, 221, 0.1)' : 'transparent',
                  border: 'none',
                  borderRadius: '0.5rem',
                  color: activeTab === 'overview' ? '#f6eddd' : 'rgba(246, 237, 221, 0.6)',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  transition: 'all 0.2s ease'
                }}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('calendar')}
                style={{
                  padding: '0.5rem 1rem',
                  background: activeTab === 'calendar' ? 'rgba(246, 237, 221, 0.1)' : 'transparent',
                  border: 'none',
                  borderRadius: '0.5rem',
                  color: activeTab === 'calendar' ? '#f6eddd' : 'rgba(246, 237, 221, 0.6)',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  transition: 'all 0.2s ease'
                }}
              >
                Calendar
              </button>
            </div>

            {activeTab === 'overview' ? (
              <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
                {/* Recent Logs */}
                <RecentLogs refreshKey={refreshKey} onLogWorkout={onLogWorkout} onRefresh={onRefresh} />

                {/* Focus Balance Chart */}
                <FocusBalanceChart focusAreaCounts={stats.focusAreaCounts} />
              </div>
            ) : (
              <CalendarView refreshKey={refreshKey} />
            )}
          </>
        ) : (
          /* Empty State */
          <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
            <div style={{
              width: '4rem',
              height: '4rem',
              borderRadius: '1rem',
              background: 'rgba(246, 237, 221, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem'
            }}>
              <svg style={{ width: '2rem', height: '2rem', opacity: 0.6 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Start Tracking Your Workouts</h2>
            <p style={{ color: 'rgba(246, 237, 221, 0.6)', marginBottom: '1.5rem', maxWidth: '24rem', margin: '0 auto 1.5rem' }}>
              Log your first workout to start building your streak and tracking your progress.
            </p>
            <button onClick={onLogWorkout} className="btn btn-primary">
              Log Your First Workout
            </button>
          </div>
        )}

        {/* Back Button */}
        <div style={{ textAlign: 'center', marginTop: '3rem' }}>
          <Link href="/" className="btn btn-outline">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
