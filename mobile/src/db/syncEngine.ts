import { getDatabase } from './schema';
import { getUnsyncedLogs, markLogSynced } from './workoutOps';
import { createLog } from '@/api/track';
import type { CreateWorkoutLogRequest } from '@shared/types';

interface SyncQueueItem {
  id: number;
  operation: string;
  entityType: string;
  entityId: string;
  payload: string;
  retryCount: number;
  maxRetries: number;
  createdAt: string;
  lastAttemptedAt: string | null;
}

export async function addToSyncQueue(
  operation: 'create' | 'update' | 'delete',
  entityType: string,
  entityId: string,
  payload: Record<string, unknown>,
): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT INTO sync_queue (operation, entity_type, entity_id, payload, created_at)
     VALUES (?, ?, ?, ?, ?)`,
    operation,
    entityType,
    entityId,
    JSON.stringify(payload),
    new Date().toISOString(),
  );
}

export async function getSyncQueueItems(): Promise<SyncQueueItem[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync(
    `SELECT * FROM sync_queue WHERE retry_count < max_retries ORDER BY created_at ASC`,
  );
  return (rows as Record<string, unknown>[]).map((row) => ({
    id: row.id as number,
    operation: row.operation as string,
    entityType: row.entity_type as string,
    entityId: row.entity_id as string,
    payload: row.payload as string,
    retryCount: row.retry_count as number,
    maxRetries: row.max_retries as number,
    createdAt: row.created_at as string,
    lastAttemptedAt: row.last_attempted_at as string | null,
  }));
}

export async function removeSyncQueueItem(id: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(`DELETE FROM sync_queue WHERE id = ?`, id);
}

async function incrementRetry(id: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `UPDATE sync_queue SET retry_count = retry_count + 1, last_attempted_at = ? WHERE id = ?`,
    new Date().toISOString(),
    id,
  );
}

export async function processSyncQueue(): Promise<{ synced: number; failed: number }> {
  let synced = 0;
  let failed = 0;

  // 1. Sync unsynced workout logs
  const unsyncedLogs = await getUnsyncedLogs();
  for (const log of unsyncedLogs) {
    try {
      const data: CreateWorkoutLogRequest = {
        workoutDate: log.workoutDate,
        durationMinutes: log.durationMinutes,
        workoutType: log.workoutType,
        rpe: log.rpe,
        notes: log.notes || undefined,
        focusAreas: log.focusAreas,
        studioId: log.studioId || undefined,
        customStudioName: log.customStudioName || undefined,
      };
      const result = await createLog(data);
      await markLogSynced(log.id, result.log.id);
      synced++;
    } catch {
      failed++;
    }
  }

  // 2. Process generic sync queue items
  const queueItems = await getSyncQueueItems();
  for (const item of queueItems) {
    try {
      await processQueueItem(item);
      await removeSyncQueueItem(item.id);
      synced++;
    } catch {
      await incrementRetry(item.id);
      failed++;
    }
  }

  return { synced, failed };
}

async function processQueueItem(item: SyncQueueItem): Promise<void> {
  const payload = JSON.parse(item.payload);

  if (item.entityType === 'workout_log' && item.operation === 'create') {
    const result = await createLog(payload as CreateWorkoutLogRequest);
    await markLogSynced(item.entityId, result.log.id);
  }
  // Add more entity types and operations as needed
}

export async function getSyncQueueCount(): Promise<number> {
  const db = await getDatabase();
  const result = await db.getFirstAsync(
    `SELECT COUNT(*) as count FROM sync_queue WHERE retry_count < max_retries`,
  );
  return (result as { count: number })?.count || 0;
}
