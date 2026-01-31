import { getDatabase } from './schema';
import { getUnsyncedLogs, markLogSynced } from './workoutOps';
import { createLog, getStats } from '@/api/track';
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

/**
 * Calculate exponential backoff delay in milliseconds.
 * Base delay: 5 seconds, doubling each retry (5s, 10s, 20s, 40s, 80s cap).
 */
function shouldRetry(item: SyncQueueItem): boolean {
  if (item.retryCount >= item.maxRetries) return false;
  if (!item.lastAttemptedAt) return true;

  const backoffMs = Math.min(5000 * Math.pow(2, item.retryCount), 80000);
  const lastAttempt = new Date(item.lastAttemptedAt).getTime();
  return Date.now() - lastAttempt >= backoffMs;
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

  // 2. Process generic sync queue items (with exponential backoff)
  const queueItems = await getSyncQueueItems();
  for (const item of queueItems) {
    if (!shouldRetry(item)) continue;
    try {
      await processQueueItem(item);
      await removeSyncQueueItem(item.id);
      synced++;
    } catch {
      await incrementRetry(item.id);
      failed++;
    }
  }

  // 3. Refresh cached stats after syncing
  if (synced > 0) {
    try {
      const statsData = await getStats();
      await cacheStats('track-stats', statsData);
    } catch {
      // Non-critical — stats will refresh on next load
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

// ---------------------------------------------------------------------------
// Stats caching
// ---------------------------------------------------------------------------

export async function cacheStats(key: string, data: unknown): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT OR REPLACE INTO cached_stats (key, data, cached_at) VALUES (?, ?, ?)`,
    key,
    JSON.stringify(data),
    new Date().toISOString(),
  );
}

export async function getCachedStats<T>(key: string, maxAgeMs = 5 * 60 * 1000): Promise<T | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync(
    `SELECT data, cached_at FROM cached_stats WHERE key = ?`,
    key,
  );
  if (!row) return null;

  const { data, cached_at } = row as { data: string; cached_at: string };
  const age = Date.now() - new Date(cached_at).getTime();
  if (age > maxAgeMs) return null;

  return JSON.parse(data) as T;
}

export async function clearCachedStats(): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(`DELETE FROM cached_stats`);
}
