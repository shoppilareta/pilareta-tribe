import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { useAuthStore } from '@/stores/authStore';

const REMINDER_ID = 'inactivity-reminder';
const DAYS_INACTIVE = 7;

/**
 * Schedules a local push notification 7 days from now.
 * Call this after every workout log to reset the timer.
 * If the user logs another workout within 7 days, the old reminder is cancelled.
 */
export async function scheduleInactivityReminder() {
  try {
    // Cancel any existing reminder
    await Notifications.cancelScheduledNotificationAsync(REMINDER_ID).catch(() => {});

    // Schedule new reminder 7 days out
    await Notifications.scheduleNotificationAsync({
      identifier: REMINDER_ID,
      content: {
        title: 'We miss you!',
        body: "It's been a week since your last workout. A quick session can make all the difference!",
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: DAYS_INACTIVE * 24 * 60 * 60,
        repeats: false,
      },
    });
  } catch {
    // Notifications may not be available (simulator, permissions denied)
  }
}

/**
 * Cancel the inactivity reminder (e.g., when user opts out).
 */
export async function cancelInactivityReminder() {
  try {
    await Notifications.cancelScheduledNotificationAsync(REMINDER_ID);
  } catch {
    // Ignore
  }
}

/**
 * Hook to set up notification handling and schedule initial reminder.
 * Call in the root layout or track screen.
 */
export function useInactivityReminder() {
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) return;

    // Configure notification handler
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });

    // Schedule initial reminder (will be rescheduled on each workout log)
    scheduleInactivityReminder();
  }, [isAuthenticated]);
}
