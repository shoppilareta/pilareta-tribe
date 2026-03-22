import * as SecureStore from 'expo-secure-store';

const SAVED_SESSIONS_KEY = 'pilareta_saved_sessions';

export interface SavedSession {
  name: string;
  sessionId: string;
  createdAt: string;
}

export async function getSavedSessions(): Promise<SavedSession[]> {
  try {
    const val = await SecureStore.getItemAsync(SAVED_SESSIONS_KEY);
    return val ? JSON.parse(val) : [];
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
  const updated = [session, ...sessions];
  await SecureStore.setItemAsync(SAVED_SESSIONS_KEY, JSON.stringify(updated));
  return updated;
}

export async function removeSavedSession(sessionId: string): Promise<SavedSession[]> {
  const sessions = await getSavedSessions();
  const updated = sessions.filter((s) => s.sessionId !== sessionId);
  await SecureStore.setItemAsync(SAVED_SESSIONS_KEY, JSON.stringify(updated));
  return updated;
}
