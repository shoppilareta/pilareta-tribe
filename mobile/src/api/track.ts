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
