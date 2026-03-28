import { create } from 'zustand';

interface LiveWorkoutState {
  isActive: boolean;
  workoutType: string;
  startTime: number | null; // Date.now()
  pausedAt: number | null;
  totalPausedMs: number;
  distanceKm: number;

  start: (workoutType: string) => void;
  pause: () => void;
  resume: () => void;
  updateDistance: (km: number) => void;
  end: () => { durationMinutes: number; workoutType: string; distanceKm: number };
  reset: () => void;
  getElapsedMs: () => number;
}

export const useLiveWorkoutStore = create<LiveWorkoutState>((set, get) => ({
  isActive: false,
  workoutType: 'reformer',
  startTime: null,
  pausedAt: null,
  totalPausedMs: 0,
  distanceKm: 0,

  start: (workoutType) =>
    set({
      isActive: true,
      workoutType,
      startTime: Date.now(),
      pausedAt: null,
      totalPausedMs: 0,
      distanceKm: 0,
    }),

  pause: () => {
    const { pausedAt, isActive } = get();
    if (isActive && !pausedAt) set({ pausedAt: Date.now() });
  },

  resume: () => {
    const { pausedAt, totalPausedMs, isActive } = get();
    if (isActive && pausedAt) {
      const pauseDuration = Math.max(0, Date.now() - pausedAt);
      set({
        pausedAt: null,
        totalPausedMs: totalPausedMs + pauseDuration,
      });
    }
  },

  updateDistance: (km) => set({ distanceKm: km }),

  end: () => {
    const { startTime, totalPausedMs, pausedAt, workoutType, distanceKm } = get();
    const now = Date.now();

    if (!startTime) {
      // Safety: no start time means nothing to calculate
      set({
        isActive: false,
        startTime: null,
        pausedAt: null,
        totalPausedMs: 0,
      });
      return { durationMinutes: 1, workoutType, distanceKm };
    }

    let elapsed = now - startTime - totalPausedMs;
    if (pausedAt) {
      // Account for current pause duration
      elapsed -= Math.max(0, now - pausedAt);
    }
    elapsed = Math.max(0, elapsed);
    const durationMinutes = Math.max(1, Math.round(elapsed / 60000));

    set({
      isActive: false,
      startTime: null,
      pausedAt: null,
      totalPausedMs: 0,
    });

    return { durationMinutes, workoutType, distanceKm };
  },

  reset: () =>
    set({
      isActive: false,
      workoutType: 'reformer',
      startTime: null,
      pausedAt: null,
      totalPausedMs: 0,
      distanceKm: 0,
    }),

  getElapsedMs: () => {
    const { startTime, totalPausedMs, pausedAt } = get();
    if (!startTime) return 0;
    const now = Date.now();
    let elapsed = now - startTime - totalPausedMs;
    if (pausedAt) {
      elapsed -= Math.max(0, now - pausedAt);
    }
    return Math.max(0, elapsed);
  },
}));
