import { getDatabase } from './schema';
import type { WorkoutLog } from '@shared/types';

// Generate a local UUID for offline-created logs
function generateLocalId(): string {
  return 'local_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);
}

export interface LocalWorkoutLog {
  id: string;
  serverId: string | null;
  userId: string;
  workoutDate: string;
  durationMinutes: number;
  workoutType: string;
  rpe: number;
  notes: string | null;
  calorieEstimate: number | null;
  focusAreas: string[];
  imageUrl: string | null;
  sessionId: string | null;
  studioId: string | null;
  customStudioName: string | null;
  isShared: boolean;
  createdAt: string;
  updatedAt: string;
  synced: boolean;
}

function rowToLog(row: Record<string, unknown>): LocalWorkoutLog {
  return {
    id: row.id as string,
    serverId: row.server_id as string | null,
    userId: row.user_id as string,
    workoutDate: row.workout_date as string,
    durationMinutes: row.duration_minutes as number,
    workoutType: row.workout_type as string,
    rpe: row.rpe as number,
    notes: row.notes as string | null,
    calorieEstimate: row.calorie_estimate as number | null,
    focusAreas: JSON.parse((row.focus_areas as string) || '[]'),
    imageUrl: row.image_url as string | null,
    sessionId: row.session_id as string | null,
    studioId: row.studio_id as string | null,
    customStudioName: row.custom_studio_name as string | null,
    isShared: (row.is_shared as number) === 1,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
    synced: (row.synced as number) === 1,
  };
}

export function localLogToWorkoutLog(local: LocalWorkoutLog): WorkoutLog {
  return {
    id: local.serverId || local.id,
    userId: local.userId,
    workoutDate: local.workoutDate,
    durationMinutes: local.durationMinutes,
    workoutType: local.workoutType,
    rpe: local.rpe,
    notes: local.notes,
    calorieEstimate: local.calorieEstimate,
    focusAreas: local.focusAreas,
    imageUrl: local.imageUrl,
    sessionId: local.sessionId,
    studioId: local.studioId,
    customStudioName: local.customStudioName,
    isShared: local.isShared,
    sharedPostId: null,
    createdAt: local.createdAt,
    updatedAt: local.updatedAt,
  };
}

export async function saveLogLocally(
  userId: string,
  data: {
    workoutDate: string;
    durationMinutes: number;
    workoutType: string;
    rpe: number;
    notes?: string;
    focusAreas?: string[];
    studioId?: string;
    customStudioName?: string;
  }
): Promise<LocalWorkoutLog> {
  const db = await getDatabase();
  const now = new Date().toISOString();
  const id = generateLocalId();

  await db.runAsync(
    `INSERT INTO workout_logs (id, server_id, user_id, workout_date, duration_minutes, workout_type, rpe, notes, focus_areas, studio_id, custom_studio_name, created_at, updated_at, synced)
     VALUES (?, NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`,
    id,
    userId,
    data.workoutDate,
    data.durationMinutes,
    data.workoutType,
    data.rpe,
    data.notes || null,
    JSON.stringify(data.focusAreas || []),
    data.studioId || null,
    data.customStudioName || null,
    now,
    now,
  );

  return {
    id,
    serverId: null,
    userId,
    workoutDate: data.workoutDate,
    durationMinutes: data.durationMinutes,
    workoutType: data.workoutType,
    rpe: data.rpe,
    notes: data.notes || null,
    calorieEstimate: null,
    focusAreas: data.focusAreas || [],
    imageUrl: null,
    sessionId: null,
    studioId: data.studioId || null,
    customStudioName: data.customStudioName || null,
    isShared: false,
    createdAt: now,
    updatedAt: now,
    synced: false,
  };
}

export async function cacheServerLogs(logs: WorkoutLog[]): Promise<void> {
  const db = await getDatabase();

  for (const log of logs) {
    await db.runAsync(
      `INSERT OR REPLACE INTO workout_logs (id, server_id, user_id, workout_date, duration_minutes, workout_type, rpe, notes, calorie_estimate, focus_areas, image_url, session_id, studio_id, custom_studio_name, is_shared, created_at, updated_at, synced)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      log.id,
      log.id,
      log.userId,
      log.workoutDate,
      log.durationMinutes,
      log.workoutType,
      log.rpe,
      log.notes || null,
      log.calorieEstimate || null,
      JSON.stringify(log.focusAreas),
      log.imageUrl || null,
      log.sessionId || null,
      log.studioId || null,
      log.customStudioName || null,
      log.isShared ? 1 : 0,
      log.createdAt,
      log.updatedAt,
    );
  }
}

export async function getLocalLogs(userId: string, limit = 20): Promise<LocalWorkoutLog[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync(
    `SELECT * FROM workout_logs WHERE user_id = ? ORDER BY workout_date DESC, created_at DESC LIMIT ?`,
    userId,
    limit,
  );
  return (rows as Record<string, unknown>[]).map(rowToLog);
}

export async function getUnsyncedLogs(): Promise<LocalWorkoutLog[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync(
    `SELECT * FROM workout_logs WHERE synced = 0 ORDER BY created_at ASC`,
  );
  return (rows as Record<string, unknown>[]).map(rowToLog);
}

export async function markLogSynced(localId: string, serverId: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `UPDATE workout_logs SET server_id = ?, synced = 1 WHERE id = ?`,
    serverId,
    localId,
  );
}

export async function deleteLocalLog(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(`DELETE FROM workout_logs WHERE id = ?`, id);
}
