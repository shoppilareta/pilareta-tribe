import { useState, useEffect, useRef, useCallback } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';

const PUSH_TOKEN_KEY = 'pilareta_push_token';
const STREAK_REMINDER_KEY = 'pilareta_streak_reminder';

// Configure how notifications are handled when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

interface NotificationState {
  pushToken: string | null;
  streakReminderEnabled: boolean;
  permissionGranted: boolean;
}

/**
 * Hook for managing push notifications and local streak reminders.
 *
 * - Registers for push token on mount (if device supports it)
 * - Handles incoming notification taps (navigates to Track tab)
 * - Schedules/cancels daily streak reminder notifications
 */
export function useNotifications() {
  const [state, setState] = useState<NotificationState>({
    pushToken: null,
    streakReminderEnabled: false,
    permissionGranted: false,
  });
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  useEffect(() => {
    (async () => {
      // Load stored preference
      const storedReminder = await SecureStore.getItemAsync(STREAK_REMINDER_KEY);
      const storedToken = await SecureStore.getItemAsync(PUSH_TOKEN_KEY);

      setState((s) => ({
        ...s,
        streakReminderEnabled: storedReminder === 'true',
        pushToken: storedToken,
      }));

      // Request permissions and register
      const token = await registerForPushNotifications();
      if (token) {
        setState((s) => ({ ...s, pushToken: token, permissionGranted: true }));
      }
    })();

    // Listen for incoming notifications (foreground)
    notificationListener.current = Notifications.addNotificationReceivedListener(() => {
      // Notification received while app is open — no-op, just show it
    });

    // Listen for notification taps
    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data = response.notification.request.content.data;
        if (data?.screen === 'track') {
          router.push('/(tabs)/track');
        } else if (data?.screen === 'log' && data.logId) {
          router.push({ pathname: '/(tabs)/track/[id]', params: { id: data.logId as string } });
        }
      },
    );

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  /**
   * Toggle daily streak reminder on/off.
   * When enabled, schedules a daily notification at 7pm local time.
   */
  const toggleStreakReminder = useCallback(async (): Promise<boolean> => {
    const newValue = !state.streakReminderEnabled;

    if (newValue) {
      // Check permissions first
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== 'granted') {
        const { status: newStatus } = await Notifications.requestPermissionsAsync();
        if (newStatus !== 'granted') return false;
      }

      await scheduleStreakReminder();
      await SecureStore.setItemAsync(STREAK_REMINDER_KEY, 'true');
    } else {
      await cancelStreakReminder();
      await SecureStore.setItemAsync(STREAK_REMINDER_KEY, 'false');
    }

    setState((s) => ({ ...s, streakReminderEnabled: newValue }));
    return newValue;
  }, [state.streakReminderEnabled]);

  return {
    ...state,
    toggleStreakReminder,
  };
}

// ---------------------------------------------------------------------------
// Registration
// ---------------------------------------------------------------------------

async function registerForPushNotifications(): Promise<string | null> {
  if (!Device.isDevice) {
    // Push tokens only work on physical devices
    return null;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Default',
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#f6eddd',
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') return null;

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

// ---------------------------------------------------------------------------
// Streak reminders
// ---------------------------------------------------------------------------

const STREAK_NOTIFICATION_ID = 'pilareta-streak-reminder';

async function scheduleStreakReminder(): Promise<void> {
  // Cancel any existing reminder first
  await cancelStreakReminder();

  // Schedule daily at 7pm local time
  await Notifications.scheduleNotificationAsync({
    identifier: STREAK_NOTIFICATION_ID,
    content: {
      title: 'Keep your streak alive!',
      body: "Don't forget to log your Pilates workout today.",
      data: { screen: 'track' },
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: 19,
      minute: 0,
    },
  });
}

async function cancelStreakReminder(): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(STREAK_NOTIFICATION_ID);
}
