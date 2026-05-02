import { useState, useEffect, useRef, useCallback } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';
import { apiFetch } from '@/api/client';

const PUSH_TOKEN_KEY = 'pilareta_push_token';
const PUSH_REGISTERED_KEY = 'pilareta_push_registered';

/**
 * Hook for registering push tokens with the backend and handling
 * notification events (received and tapped).
 *
 * This complements the existing useNotifications hook (which handles
 * local streak reminders) by adding server-side token registration
 * for admin-sent push notifications.
 *
 * Usage: Call in root layout after auth is initialized.
 */
export function usePushNotifications() {
  const [pushToken, setPushToken] = useState<string | null>(null);
  const [registered, setRegistered] = useState(false);
  const notificationListener = useRef<Notifications.EventSubscription | null>(null);
  const responseListener = useRef<Notifications.EventSubscription | null>(null);

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const accessToken = useAuthStore((s) => s.accessToken);

  // Register the Expo push token with our backend
  const registerWithBackend = useCallback(
    async (token: string) => {
      if (!accessToken) return;

      try {
        const alreadyRegistered = await SecureStore.getItemAsync(PUSH_REGISTERED_KEY);
        // Re-register if token or auth changed
        if (alreadyRegistered === token) {
          setRegistered(true);
          return;
        }

        await apiFetch('/api/push/register', {
          method: 'POST',
          body: JSON.stringify({
            token,
            platform: Platform.OS as 'ios' | 'android',
          }),
        });

        await SecureStore.setItemAsync(PUSH_REGISTERED_KEY, token);
        setRegistered(true);
      } catch (error) {
        console.warn('Failed to register push token with backend:', error);
      }
    },
    [accessToken]
  );

  // Get push token and register
  useEffect(() => {
    if (!isAuthenticated) return;

    let cancelled = false;

    (async () => {
      try {
        const token = await getExpoPushToken();
        if (cancelled || !token) return;

        setPushToken(token);
        await registerWithBackend(token);
      } catch (error) {
        console.warn('Push notification setup failed:', error);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, registerWithBackend]);

  // Handle notification events
  useEffect(() => {
    // Listen for notifications received while the app is in the foreground
    notificationListener.current = Notifications.addNotificationReceivedListener(
      (_notification) => {
        // Notification displayed automatically via the handler set in useNotifications
      }
    );

    // Listen for notification taps (user interacted with the notification)
    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data = response.notification.request.content.data;
        handleNotificationTap(data);
      }
    );

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, []);

  return {
    pushToken,
    registered,
  };
}

/**
 * Get the Expo push token, requesting permissions if needed.
 */
async function getExpoPushToken(): Promise<string | null> {
  if (!Device.isDevice) {
    // Push tokens only work on physical devices
    return null;
  }

  // Set up Android notification channel
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Default',
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#f6eddd',
    });
  }

  // Check existing permission
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  // Request permission if not already granted
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return null;
  }

  // Try to load cached token first
  const cached = await SecureStore.getItemAsync(PUSH_TOKEN_KEY);
  if (cached) return cached;

  try {
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: undefined, // Uses project ID from app.json
    });
    const token = tokenData.data;
    await SecureStore.setItemAsync(PUSH_TOKEN_KEY, token);
    return token;
  } catch {
    return null;
  }
}

/**
 * Navigate based on notification data payload.
 */
function handleNotificationTap(data: Record<string, unknown> | undefined) {
  if (!data) return;

  // Handle screen-based navigation
  if (data.screen === 'track') {
    router.push('/(tabs)/track');
  } else if (data.screen === 'community') {
    router.push('/(tabs)/community');
  } else if (data.screen === 'shop') {
    router.push('/(tabs)/shop');
  } else if (data.screen === 'learn') {
    router.push('/(tabs)/learn');
  } else if (data.screen === 'log' && data.logId) {
    router.push({ pathname: '/(tabs)/track/[id]', params: { id: data.logId as string } });
  }

  // Handle URL-based deep linking
  if (typeof data.url === 'string' && data.url.startsWith('/')) {
    router.push(data.url as any);
  }
}
