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
