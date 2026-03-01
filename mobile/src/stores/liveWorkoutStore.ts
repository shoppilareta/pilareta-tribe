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
    const { pausedAt } = get();
    if (!pausedAt) set({ pausedAt: Date.now() });
  },

  resume: () => {
    const { pausedAt, totalPausedMs } = get();
    if (pausedAt) {
      set({
        pausedAt: null,
        totalPausedMs: totalPausedMs + (Date.now() - pausedAt),
      });
    }
  },

  updateDistance: (km) => set({ distanceKm: km }),

  end: () => {
    const { startTime, totalPausedMs, pausedAt, workoutType, distanceKm } = get();
    let elapsed = Date.now() - (startTime || Date.now()) - totalPausedMs;
    if (pausedAt) elapsed -= Date.now() - pausedAt;
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
    let elapsed = Date.now() - startTime - totalPausedMs;
    if (pausedAt) elapsed -= Date.now() - pausedAt;
    return Math.max(0, elapsed);
  },
}));
