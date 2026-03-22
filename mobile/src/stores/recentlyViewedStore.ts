import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

const STORAGE_KEY = 'pilareta_recently_viewed';
const MAX_ITEMS = 10;

interface RecentlyViewedState {
  handles: string[];
  loaded: boolean;
  addHandle: (handle: string) => void;
  loadFromStorage: () => Promise<void>;
}

export const useRecentlyViewedStore = create<RecentlyViewedState>((set, get) => ({
  handles: [],
  loaded: false,

  addHandle: (handle: string) => {
    const current = get().handles.filter(h => h !== handle);
    const updated = [handle, ...current].slice(0, MAX_ITEMS);
    set({ handles: updated });
    SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify(updated)).catch(() => {});
  },

  loadFromStorage: async () => {
    try {
      const stored = await SecureStore.getItemAsync(STORAGE_KEY);
      if (stored) {
        set({ handles: JSON.parse(stored), loaded: true });
      } else {
        set({ loaded: true });
      }
    } catch {
      set({ loaded: true });
    }
  },
}));
