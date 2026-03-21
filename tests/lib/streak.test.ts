import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * The streak calculation is coupled to Prisma, so we mock `@/lib/db`
 * to inject controlled workout log data without touching a real database.
 */

// Mock the Prisma client before importing the module under test
const mockFindMany = vi.fn();
vi.mock('@/lib/db', () => ({
  prisma: {
    workoutLog: {
      findMany: (...args: unknown[]) => mockFindMany(...args),
    },
  },
}));

// Import AFTER mocking
import { calculateStreak } from '@/lib/track/streak';

/** Helper: create a Date for N days ago (at midnight UTC) */
function daysAgo(n: number): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - n);
  return d;
}

/** Helper: create mock workout log entries for given dates */
function mockLogs(dates: Date[]) {
  return dates.map(d => ({ workoutDate: d }));
}

describe('calculateStreak', () => {
  beforeEach(() => {
    mockFindMany.mockReset();
  });

  it('returns zero streak when user has no workouts', async () => {
    mockFindMany.mockResolvedValue([]);

    const result = await calculateStreak('user-no-workouts');

    expect(result.currentStreak).toBe(0);
    expect(result.longestStreak).toBe(0);
    expect(result.lastWorkoutDate).toBeNull();
    expect(result.streakStartDate).toBeNull();
  });

  it('returns streak of 1 when user worked out today only', async () => {
    const today = daysAgo(0);
    mockFindMany.mockResolvedValue(mockLogs([today]));

    const result = await calculateStreak('user-today');

    expect(result.currentStreak).toBe(1);
    expect(result.longestStreak).toBe(1);
  });

  it('returns streak of 1 when user worked out yesterday only (grace period)', async () => {
    const yesterday = daysAgo(1);
    mockFindMany.mockResolvedValue(mockLogs([yesterday]));

    const result = await calculateStreak('user-yesterday');

    expect(result.currentStreak).toBe(1);
  });

  it('returns streak of 2 when user worked out today and yesterday', async () => {
    const today = daysAgo(0);
    const yesterday = daysAgo(1);
    mockFindMany.mockResolvedValue(mockLogs([today, yesterday]));

    const result = await calculateStreak('user-two-days');

    expect(result.currentStreak).toBe(2);
    expect(result.longestStreak).toBe(2);
  });

  it('counts consecutive days correctly for a 5-day streak', async () => {
    const dates = [daysAgo(0), daysAgo(1), daysAgo(2), daysAgo(3), daysAgo(4)];
    mockFindMany.mockResolvedValue(mockLogs(dates));

    const result = await calculateStreak('user-five-days');

    expect(result.currentStreak).toBe(5);
    expect(result.longestStreak).toBe(5);
  });

  it('resets current streak when there is a gap', async () => {
    // Worked out today, yesterday, and 5 days ago (gap of 2 days)
    const dates = [daysAgo(0), daysAgo(1), daysAgo(4)];
    mockFindMany.mockResolvedValue(mockLogs(dates));

    const result = await calculateStreak('user-gap');

    expect(result.currentStreak).toBe(2); // only today + yesterday
  });

  it('current streak is 0 when last workout was 3 days ago', async () => {
    const dates = [daysAgo(3), daysAgo(4), daysAgo(5)];
    mockFindMany.mockResolvedValue(mockLogs(dates));

    const result = await calculateStreak('user-old');

    expect(result.currentStreak).toBe(0);
    // But longest streak should still reflect the historical 3-day streak
    expect(result.longestStreak).toBe(3);
  });

  it('deduplicates multiple workouts on the same day', async () => {
    // Two workouts today, two yesterday
    const today1 = daysAgo(0);
    const today2 = new Date(today1); // same date
    const yesterday1 = daysAgo(1);
    const yesterday2 = new Date(yesterday1);

    mockFindMany.mockResolvedValue(mockLogs([today1, today2, yesterday1, yesterday2]));

    const result = await calculateStreak('user-dups');

    expect(result.currentStreak).toBe(2); // not 4
  });

  it('tracks longest streak even when current streak is shorter', async () => {
    // Historical 4-day streak, then gap, then current 2-day streak
    const dates = [
      daysAgo(0), daysAgo(1),      // current: 2 days
      // gap at daysAgo(2)
      daysAgo(3), daysAgo(4), daysAgo(5), daysAgo(6), // historical: 4 days
    ];
    mockFindMany.mockResolvedValue(mockLogs(dates));

    const result = await calculateStreak('user-longest');

    expect(result.currentStreak).toBe(2);
    expect(result.longestStreak).toBe(4);
  });

  it('sets lastWorkoutDate to the most recent workout', async () => {
    const today = daysAgo(0);
    mockFindMany.mockResolvedValue(mockLogs([today, daysAgo(1)]));

    const result = await calculateStreak('user-last');

    expect(result.lastWorkoutDate).not.toBeNull();
    // Compare using local date parts to avoid UTC offset issues
    const toLocalStr = (d: Date) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    expect(toLocalStr(result.lastWorkoutDate!)).toBe(toLocalStr(today));
  });

  it('sets streakStartDate to the earliest day in the current streak', async () => {
    const dates = [daysAgo(0), daysAgo(1), daysAgo(2)];
    mockFindMany.mockResolvedValue(mockLogs(dates));

    const result = await calculateStreak('user-start');

    expect(result.streakStartDate).not.toBeNull();
    const toLocalStr = (d: Date) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    expect(toLocalStr(result.streakStartDate!)).toBe(toLocalStr(daysAgo(2)));
  });
});
