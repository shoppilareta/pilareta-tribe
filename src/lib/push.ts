/**
 * Push Notification Service
 *
 * Sends push notifications via the Expo Push API.
 * Handles batching (Expo limit: 100 per request).
 */

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';
const BATCH_SIZE = 100;

export interface PushMessage {
  to: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  sound?: 'default' | null;
  badge?: number;
  channelId?: string;
}

export interface PushTicket {
  status: 'ok' | 'error';
  id?: string;
  message?: string;
  details?: { error?: string };
}

export interface PushResult {
  totalSent: number;
  successCount: number;
  failureCount: number;
  tickets: PushTicket[];
}

/**
 * Send push notifications to an array of Expo push tokens.
 *
 * @param tokens  - Array of Expo push tokens (e.g. ExponentPushToken[xxx])
 * @param title   - Notification title
 * @param body    - Notification body text
 * @param data    - Optional JSON data payload attached to the notification
 * @returns       - Aggregated result with success/failure counts
 */
export async function sendPushNotifications(
  tokens: string[],
  title: string,
  body: string,
  data?: Record<string, unknown>
): Promise<PushResult> {
  if (tokens.length === 0) {
    return { totalSent: 0, successCount: 0, failureCount: 0, tickets: [] };
  }

  // Build messages
  const messages: PushMessage[] = tokens.map((token) => ({
    to: token,
    title,
    body,
    sound: 'default',
    ...(data && { data }),
  }));

  // Split into batches of BATCH_SIZE
  const batches: PushMessage[][] = [];
  for (let i = 0; i < messages.length; i += BATCH_SIZE) {
    batches.push(messages.slice(i, i + BATCH_SIZE));
  }

  const allTickets: PushTicket[] = [];

  for (const batch of batches) {
    try {
      const response = await fetch(EXPO_PUSH_URL, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Accept-Encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(batch),
      });

      if (!response.ok) {
        console.error('Expo Push API error:', response.status, await response.text());
        // Mark all in this batch as failures
        for (let i = 0; i < batch.length; i++) {
          allTickets.push({
            status: 'error',
            message: `HTTP ${response.status}`,
          });
        }
        continue;
      }

      const result = await response.json();
      const tickets: PushTicket[] = result.data || [];
      allTickets.push(...tickets);
    } catch (error) {
      console.error('Expo Push API request failed:', error);
      // Mark all in this batch as failures
      for (let i = 0; i < batch.length; i++) {
        allTickets.push({
          status: 'error',
          message: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }
  }

  const successCount = allTickets.filter((t) => t.status === 'ok').length;
  const failureCount = allTickets.filter((t) => t.status === 'error').length;

  return {
    totalSent: tokens.length,
    successCount,
    failureCount,
    tickets: allTickets,
  };
}
