import { useState, useCallback, useEffect } from 'react';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const HEALTH_ENABLED_KEY = 'pilareta_health_enabled';

interface HealthWorkout {
  id: string;
  startDate: string;
  endDate: string;
  durationMinutes: number;
  calories?: number;
  source: string;
}

interface HealthState {
  available: boolean;
  enabled: boolean;
  authorized: boolean;
  loading: boolean;
}

/**
 * Unified health integration hook for iOS HealthKit and Android Health Connect.
 *
 * Native modules (react-native-health, react-native-health-connect) are loaded
 * dynamically. When running in Expo Go they won't resolve, so the hook degrades
 * gracefully — `available` will be false.
 *
 * Once an EAS development or production build includes the native modules,
 * the hook will detect them and enable full read/write capabilities.
 */
export function useHealth() {
  const [state, setState] = useState<HealthState>({
    available: false,
    enabled: false,
    authorized: false,
    loading: true,
  });

  // Check availability and stored preference on mount
  useEffect(() => {
    (async () => {
      const isAvailable = await checkHealthAvailability();
      const storedEnabled = await SecureStore.getItemAsync(HEALTH_ENABLED_KEY);
      const enabled = storedEnabled === 'true';

      setState({
        available: isAvailable,
        enabled: enabled && isAvailable,
        authorized: false,
        loading: false,
      });

      // If previously enabled, try to silently check authorization
      if (enabled && isAvailable) {
        const authorized = await checkAuthorization();
        setState((s) => ({ ...s, authorized }));
      }
    })();
  }, []);

  /**
   * Toggle health integration on/off.
   * When enabling, requests permissions from the OS.
   */
  const toggle = useCallback(async (): Promise<boolean> => {
    if (!state.available) return false;

    if (state.enabled) {
      // Disable
      await SecureStore.setItemAsync(HEALTH_ENABLED_KEY, 'false');
      setState((s) => ({ ...s, enabled: false, authorized: false }));
      return false;
    }

    // Enable — request permissions
    const authorized = await requestPermissions();
    if (authorized) {
      await SecureStore.setItemAsync(HEALTH_ENABLED_KEY, 'true');
      setState((s) => ({ ...s, enabled: true, authorized: true }));
      return true;
    }

    return false;
  }, [state.available, state.enabled]);

  /**
   * Write a pilates workout to the health store.
   * Called after logging a workout in the app.
   */
  const writeWorkout = useCallback(
    async (params: {
      startDate: string;
      durationMinutes: number;
      calories?: number;
      logId: string;
    }): Promise<boolean> => {
      if (!state.enabled || !state.authorized) return false;

      try {
        if (Platform.OS === 'ios') {
          return await writeHealthKitWorkout(params);
        } else if (Platform.OS === 'android') {
          return await writeHealthConnectWorkout(params);
        }
      } catch (err) {
        console.warn('Failed to write health workout:', err);
      }
      return false;
    },
    [state.enabled, state.authorized],
  );

  /**
   * Read pilates workouts from the health store for import.
   */
  const readWorkouts = useCallback(
    async (startDate: string, endDate: string): Promise<HealthWorkout[]> => {
      if (!state.enabled || !state.authorized) return [];

      try {
        if (Platform.OS === 'ios') {
          return await readHealthKitWorkouts(startDate, endDate);
        } else if (Platform.OS === 'android') {
          return await readHealthConnectWorkouts(startDate, endDate);
        }
      } catch (err) {
        console.warn('Failed to read health workouts:', err);
      }
      return [];
    },
    [state.enabled, state.authorized],
  );

  return {
    ...state,
    toggle,
    writeWorkout,
    readWorkouts,
  };
}

// ---------------------------------------------------------------------------
// Platform-specific implementations
// ---------------------------------------------------------------------------

async function checkHealthAvailability(): Promise<boolean> {
  try {
    if (Platform.OS === 'ios') {
      const AppleHealthKit = await importHealthKit();
      if (!AppleHealthKit) return false;
      return new Promise((resolve) => {
        AppleHealthKit.isAvailable((err: unknown, available: boolean) => {
          resolve(!err && available);
        });
      });
    } else if (Platform.OS === 'android') {
      const HC = await importHealthConnect();
      if (!HC) return false;
      const status = await HC.getSdkStatus();
      return status === HC.SdkAvailabilityStatus?.SDK_AVAILABLE;
    }
  } catch {
    // Module not installed
  }
  return false;
}

async function checkAuthorization(): Promise<boolean> {
  try {
    if (Platform.OS === 'ios') {
      const AppleHealthKit = await importHealthKit();
      if (!AppleHealthKit) return false;
      return new Promise((resolve) => {
        AppleHealthKit.getAuthStatus(
          { permissions: getHealthKitPermissions() },
          (err: unknown, result: { permissions?: { read?: number[] } }) => {
            if (err) return resolve(false);
            // Check if at least read permissions are granted
            const readStatuses = result?.permissions?.read || [];
            resolve(readStatuses.every((s: number) => s === 2)); // 2 = authorized
          },
        );
      });
    } else if (Platform.OS === 'android') {
      // Health Connect doesn't have a direct "check" - permissions are checked per request
      return true;
    }
  } catch {
    // Module not available
  }
  return false;
}

async function requestPermissions(): Promise<boolean> {
  try {
    if (Platform.OS === 'ios') {
      const AppleHealthKit = await importHealthKit();
      if (!AppleHealthKit) return false;
      return new Promise((resolve) => {
        AppleHealthKit.initHealthKit(getHealthKitPermissions(), (err: unknown) => {
          resolve(!err);
        });
      });
    } else if (Platform.OS === 'android') {
      const HC = await importHealthConnect();
      if (!HC) return false;
      await HC.initialize();
      const granted = await HC.requestPermission([
        { accessType: 'read', recordType: 'ExerciseSession' },
        { accessType: 'write', recordType: 'ExerciseSession' },
      ]);
      return granted.length > 0;
    }
  } catch {
    // Module not available
  }
  return false;
}

async function writeHealthKitWorkout(params: {
  startDate: string;
  durationMinutes: number;
  calories?: number;
  logId: string;
}): Promise<boolean> {
  const AppleHealthKit = await importHealthKit();
  if (!AppleHealthKit) return false;

  const startDate = new Date(params.startDate);
  const endDate = new Date(startDate.getTime() + params.durationMinutes * 60 * 1000);

  return new Promise((resolve) => {
    AppleHealthKit.saveWorkout(
      {
        type: 'Pilates',
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        energyBurned: params.calories || 0,
        energyBurnedUnit: 'calorie',
        metadata: { pilaretaLogId: params.logId },
      },
      (err: unknown) => {
        resolve(!err);
      },
    );
  });
}

async function readHealthKitWorkouts(
  startDate: string,
  endDate: string,
): Promise<HealthWorkout[]> {
  const AppleHealthKit = await importHealthKit();
  if (!AppleHealthKit) return [];

  return new Promise((resolve) => {
    AppleHealthKit.getSamples(
      {
        typeIdentifier: 'HKWorkoutTypeIdentifier',
        startDate,
        endDate,
      },
      (err: unknown, results: Array<{
        id: string;
        startDate: string;
        endDate: string;
        duration: number;
        calories: number;
        sourceName: string;
        metadata?: { pilaretaLogId?: string };
      }>) => {
        if (err || !results) return resolve([]);
        // Filter to pilates workouts, exclude ones we created
        const workouts = results
          .filter((w) => !w.metadata?.pilaretaLogId)
          .map((w) => ({
            id: w.id,
            startDate: w.startDate,
            endDate: w.endDate,
            durationMinutes: Math.round(w.duration / 60),
            calories: w.calories ? Math.round(w.calories) : undefined,
            source: w.sourceName,
          }));
        resolve(workouts);
      },
    );
  });
}

async function writeHealthConnectWorkout(params: {
  startDate: string;
  durationMinutes: number;
  calories?: number;
  logId: string;
}): Promise<boolean> {
  const HC = await importHealthConnect();
  if (!HC) return false;

  const startDate = new Date(params.startDate);
  const endDate = new Date(startDate.getTime() + params.durationMinutes * 60 * 1000);

  try {
    await HC.insertRecords([
      {
        recordType: 'ExerciseSession',
        startTime: startDate.toISOString(),
        endTime: endDate.toISOString(),
        exerciseType: 29, // PILATES
        title: 'Pilareta Workout',
        metadata: {
          clientRecordId: params.logId,
        },
      },
    ]);
    return true;
  } catch {
    return false;
  }
}

async function readHealthConnectWorkouts(
  startDate: string,
  endDate: string,
): Promise<HealthWorkout[]> {
  const HC = await importHealthConnect();
  if (!HC) return [];

  try {
    const result = await HC.readRecords('ExerciseSession', {
      timeRangeFilter: {
        operator: 'between',
        startTime: new Date(startDate).toISOString(),
        endTime: new Date(endDate).toISOString(),
      },
    });
    return (result.records || [])
      .filter((r: { exerciseType?: number; metadata?: { clientRecordId?: string } }) =>
        r.exerciseType === 29 && !r.metadata?.clientRecordId,
      )
      .map((r: { metadata?: { id?: string }; startTime: string; endTime: string }) => ({
        id: r.metadata?.id || String(Date.now()),
        startDate: r.startTime,
        endDate: r.endTime,
        durationMinutes: Math.round(
          (new Date(r.endTime).getTime() - new Date(r.startTime).getTime()) / 60000,
        ),
        source: 'Health Connect',
      }));
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------------
// Dynamic imports — graceful degradation when native modules aren't installed
// ---------------------------------------------------------------------------

function getHealthKitPermissions() {
  return {
    permissions: {
      read: ['Workout'],
      write: ['Workout'],
    },
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function importHealthKit(): Promise<any | null> {
  try {
    return require('react-native-health').default;
  } catch {
    return null;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function importHealthConnect(): Promise<any | null> {
  try {
    return require('react-native-health-connect');
  } catch {
    return null;
  }
}
