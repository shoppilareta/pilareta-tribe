import { apiFetch } from './client';
import type {
  ExercisesResponse,
  ProgramsResponse,
  BuildSessionRequest,
  BuildSessionResponse,
} from '@shared/types';
import type { Exercise, PilatesSession } from '@shared/types';

export async function getExercises(): Promise<ExercisesResponse> {
  return apiFetch('/api/learn/exercises', { skipAuth: true });
}

export async function getExercise(slug: string): Promise<{ exercise: Exercise }> {
  return apiFetch(`/api/learn/exercises/${slug}`, { skipAuth: true });
}

export async function getPrograms(): Promise<ProgramsResponse> {
  return apiFetch('/api/learn/programs', { skipAuth: true });
}

export async function getProgram(slug: string): Promise<{ program: unknown }> {
  return apiFetch(`/api/learn/programs/${slug}`, { skipAuth: true });
}

export async function buildSession(params: BuildSessionRequest): Promise<BuildSessionResponse> {
  return apiFetch('/api/learn/build-session', {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

export async function getSession(id: string): Promise<{ session: PilatesSession }> {
  return apiFetch(`/api/learn/session/${id}`, { skipAuth: true });
}

export async function getExerciseCompletionStats(slug: string): Promise<{ completionCount: number; lastCompletedAt: string | null }> {
  try {
    return await apiFetch(`/api/learn/exercises/${slug}/stats`);
  } catch {
    // Return safe defaults when stats fail (user not logged in, network error, etc.)
    return { completionCount: 0, lastCompletedAt: null };
  }
}

export async function getProgramProgress(slug: string): Promise<{
  progress: {
    currentWeek: number;
    completedSessionIds: string[];
    status: string;
  } | null;
}> {
  try {
    return await apiFetch(`/api/learn/programs/${slug}/progress`);
  } catch {
    // Return null progress when the endpoint fails (user not logged in, etc.)
    return { progress: null };
  }
}
