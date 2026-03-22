import { apiFetch } from './client';
import type {
  TrackStatsResponse,
  TrackLogsResponse,
  CreateWorkoutLogRequest,
  UpdateWorkoutLogRequest,
  CursorPaginationParams,
} from '@shared/types';
import type { WorkoutLog } from '@shared/types';

export async function getStats(): Promise<TrackStatsResponse> {
  return apiFetch('/api/track/stats');
}

export async function updateGoals(data: { weeklyWorkoutGoal?: number | null; weeklyMinuteGoal?: number | null }) {
  return apiFetch<{ success: boolean }>('/api/track/stats', {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function getLogs(params?: CursorPaginationParams & {
  startDate?: string;
  endDate?: string;
}): Promise<TrackLogsResponse> {
  const query = new URLSearchParams();
  if (params?.cursor) query.set('cursor', params.cursor);
  if (params?.limit) query.set('limit', String(params.limit));
  if (params?.startDate) query.set('startDate', params.startDate);
  if (params?.endDate) query.set('endDate', params.endDate);

  const qs = query.toString();
  return apiFetch(`/api/track/logs${qs ? `?${qs}` : ''}`);
}

export async function createLog(data: CreateWorkoutLogRequest): Promise<{ success: boolean; log: WorkoutLog }> {
  return apiFetch('/api/track/logs', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function createLogWithImage(
  data: CreateWorkoutLogRequest,
  imageUri: string
): Promise<{ success: boolean; log: WorkoutLog }> {
  const formData = new FormData();

  // Add image
  const filename = imageUri.split('/').pop() || 'photo.jpg';
  const match = /\.(\w+)$/.exec(filename);
  const type = match ? `image/${match[1]}` : 'image/jpeg';
  formData.append('image', {
    uri: imageUri,
    name: filename,
    type,
  } as unknown as Blob);

  // Add fields
  formData.append('workoutType', data.workoutType);
  formData.append('durationMinutes', String(data.durationMinutes));
  formData.append('rpe', String(data.rpe));
  if (data.workoutDate) formData.append('workoutDate', data.workoutDate);
  if (data.notes) formData.append('notes', data.notes);
  if (data.focusAreas) formData.append('focusAreas', JSON.stringify(data.focusAreas));
  if (data.studioId) formData.append('studioId', data.studioId);
  if (data.customStudioName) formData.append('customStudioName', data.customStudioName);
  if (data.calorieEstimate) formData.append('calorieEstimate', String(data.calorieEstimate));
  if (data.distanceKm != null) formData.append('distanceKm', String(data.distanceKm));
  if (data.incline != null) formData.append('incline', String(data.incline));
  if (data.pace) formData.append('pace', data.pace);
  if (data.laps != null) formData.append('laps', String(data.laps));
  if (data.totalSets != null) formData.append('totalSets', String(data.totalSets));
  if (data.totalReps != null) formData.append('totalReps', String(data.totalReps));
  if (data.weightKg != null) formData.append('weightKg', String(data.weightKg));

  return apiFetch('/api/track/logs', {
    method: 'POST',
    body: formData,
  });
}

export async function getLog(id: string): Promise<{ log: WorkoutLog }> {
  return apiFetch(`/api/track/logs/${id}`);
}

export async function updateLog(id: string, data: UpdateWorkoutLogRequest): Promise<{ success: boolean; log: WorkoutLog }> {
  return apiFetch(`/api/track/logs/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function deleteLog(id: string): Promise<{ success: boolean }> {
  return apiFetch(`/api/track/logs/${id}`, {
    method: 'DELETE',
  });
}

export async function shareLog(id: string, caption?: string): Promise<{ success: boolean; post: unknown }> {
  return apiFetch(`/api/track/logs/${id}/share`, {
    method: 'POST',
    body: JSON.stringify({ caption }),
  });
}

export async function unshareLog(id: string): Promise<{ success: boolean }> {
  return apiFetch(`/api/track/logs/${id}/share`, {
    method: 'DELETE',
  });
}
