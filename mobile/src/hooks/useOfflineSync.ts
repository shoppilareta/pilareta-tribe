import { useEffect, useRef, useCallback } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { useQueryClient } from '@tanstack/react-query';
import { processSyncQueue, getSyncQueueCount } from '@/db/syncEngine';

export function useOfflineSync() {
  const queryClient = useQueryClient();
  const isSyncing = useRef(false);

  const sync = useCallback(async () => {
    if (isSyncing.current) return;

    const count = await getSyncQueueCount();
    if (count === 0) return;

    isSyncing.current = true;
    try {
      const result = await processSyncQueue();
      if (result.synced > 0) {
        // Invalidate queries so UI refreshes with server data
        queryClient.invalidateQueries({ queryKey: ['track-stats'] });
        queryClient.invalidateQueries({ queryKey: ['track-logs'] });
      }
    } finally {
      isSyncing.current = false;
    }
  }, [queryClient]);

  useEffect(() => {
    // Sync when network becomes available
    const unsubscribe = NetInfo.addEventListener((state) => {
      if (state.isConnected && state.isInternetReachable !== false) {
        sync();
      }
    });

    return () => unsubscribe();
  }, [sync]);

  useEffect(() => {
    // Sync when app comes to foreground
    const handleAppState = (nextState: AppStateStatus) => {
      if (nextState === 'active') {
        sync();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppState);
    return () => subscription.remove();
  }, [sync]);

  // Initial sync on mount
  useEffect(() => {
    sync();
  }, [sync]);

  return { syncNow: sync };
}
