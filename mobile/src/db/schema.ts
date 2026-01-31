import * as SQLite from 'expo-sqlite';

const DB_NAME = 'pilareta.db';

let db: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!db) {
    db = await SQLite.openDatabaseAsync(DB_NAME);
    await runMigrations(db);
  }
  return db;
}

async function runMigrations(database: SQLite.SQLiteDatabase): Promise<void> {
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS workout_logs (
      id TEXT PRIMARY KEY,
      server_id TEXT,
      user_id TEXT NOT NULL,
      workout_date TEXT NOT NULL,
      duration_minutes INTEGER NOT NULL,
      workout_type TEXT NOT NULL,
      rpe INTEGER NOT NULL,
      notes TEXT,
      calorie_estimate INTEGER,
      focus_areas TEXT NOT NULL DEFAULT '[]',
      image_url TEXT,
      session_id TEXT,
      studio_id TEXT,
      custom_studio_name TEXT,
      is_shared INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      synced INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS sync_queue (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      operation TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id TEXT NOT NULL,
      payload TEXT NOT NULL,
      retry_count INTEGER NOT NULL DEFAULT 0,
      max_retries INTEGER NOT NULL DEFAULT 5,
      created_at TEXT NOT NULL,
      last_attempted_at TEXT
    );

    CREATE TABLE IF NOT EXISTS cached_stats (
      key TEXT PRIMARY KEY,
      data TEXT NOT NULL,
      cached_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_workout_logs_user_date ON workout_logs(user_id, workout_date DESC);
    CREATE INDEX IF NOT EXISTS idx_workout_logs_synced ON workout_logs(synced);
    CREATE INDEX IF NOT EXISTS idx_sync_queue_created ON sync_queue(created_at ASC);
  `);
}

export async function closeDatabase(): Promise<void> {
  if (db) {
    await db.closeAsync();
    db = null;
  }
}
