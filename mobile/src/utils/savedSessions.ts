import * as SecureStore from 'expo-secure-store';

const SAVED_SESSIONS_KEY = 'pilareta_saved_sessions';
const MAX_SAVED_SESSIONS = 50;

export interface SavedSession {
  name: string;
  sessionId: string;
  createdAt: string;
}

export async function getSavedSessions(): Promise<SavedSession[]> {
  try {
    const val = await SecureStore.getItemAsync(SAVED_SESSIONS_KEY);
    if (!val) return [];
    const parsed = JSON.parse(val);
    // Validate structure: filter out any corrupted entries
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (s: unknown): s is SavedSession =>
        s != null &&
        typeof s === 'object' &&
        typeof (s as SavedSession).sessionId === 'string' &&
        typeof (s as SavedSession).name === 'string' &&
        (s as SavedSession).sessionId.length > 0
    );
  } catch {
    return [];
  }
}

export async function saveSession(session: SavedSession): Promise<SavedSession[]> {
  const sessions = await getSavedSessions();
  // Don't duplicate
  if (sessions.some((s) => s.sessionId === session.sessionId)) {
    return sessions;
  }
  // Prepend and cap at max
  const updated = [session, ...sessions].slice(0, MAX_SAVED_SESSIONS);
  await SecureStore.setItemAsync(SAVED_SESSIONS_KEY, JSON.stringify(updated));
  return updated;
}

export async function removeSavedSession(sessionId: string): Promise<SavedSession[]> {
  const sessions = await getSavedSessions();
  const updated = sessions.filter((s) => s.sessionId !== sessionId);
  await SecureStore.setItemAsync(SAVED_SESSIONS_KEY, JSON.stringify(updated));
  return updated;
}

/**
 * Validate saved sessions against a list of known valid session IDs.
 * Removes any saved sessions that reference sessions which no longer exist.
 * Call this on app start or when the learn screen loads.
 */
export async function pruneInvalidSessions(validSessionIds: string[]): Promise<SavedSession[]> {
  const sessions = await getSavedSessions();
  const validSet = new Set(validSessionIds);
  const pruned = sessions.filter((s) => validSet.has(s.sessionId));
  if (pruned.length !== sessions.length) {
    await SecureStore.setItemAsync(SAVED_SESSIONS_KEY, JSON.stringify(pruned));
  }
  return pruned;
}
