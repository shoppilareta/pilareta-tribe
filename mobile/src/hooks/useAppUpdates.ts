/**
 * App Update Hooks
 *
 * 1. Checks for OTA updates via expo-updates on app launch
 * 2. Monitors for UpdateRequiredError from the API client
 */

import { useEffect, useState, useCallback } from 'react';
import { Alert, Linking, Platform } from 'react-native';

// OTA update check (expo-updates)
export function useOtaUpdates() {
  useEffect(() => {
    checkForOtaUpdate();
  }, []);
}

async function checkForOtaUpdate() {
  try {
    const Updates = require('expo-updates');

    // Only check in production builds (not dev client or Expo Go)
    if (__DEV__ || !Updates.isEnabled) return;

    const update = await Updates.checkForUpdateAsync();
    if (update.isAvailable) {
      await Updates.fetchUpdateAsync();
      Alert.alert(
        'Update Available',
        'A new version has been downloaded. Restart to apply?',
        [
          { text: 'Later', style: 'cancel' },
          {
            text: 'Restart',
            onPress: () => Updates.reloadAsync(),
          },
        ]
      );
    }
  } catch {
    // Silently fail — OTA checks are best-effort
  }
}

// Force update state (for blocking UI when server returns 426)
const STORE_URLS = {
  ios: 'https://apps.apple.com/app/pilareta-tribe/id0000000000', // Replace with actual App Store ID
  android: 'https://play.google.com/store/apps/details?id=com.pilareta.tribe',
};

export function useForceUpdate() {
  const [updateRequired, setUpdateRequired] = useState(false);
  const [minVersion, setMinVersion] = useState<string | null>(null);

  const triggerForceUpdate = useCallback((min: string) => {
    setMinVersion(min);
    setUpdateRequired(true);
  }, []);

  const openStore = useCallback(() => {
    const url = Platform.OS === 'ios' ? STORE_URLS.ios : STORE_URLS.android;
    Linking.openURL(url).catch(() => {
      Alert.alert('Error', 'Could not open the app store. Please update manually.');
    });
  }, []);

  return { updateRequired, minVersion, triggerForceUpdate, openStore };
}
