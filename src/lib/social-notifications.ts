/**
 * Social Notification System
 *
 * Sends in-app + push notifications for social events
 * (likes, comments, follows, mentions).
 *
 * All functions are fire-and-forget — they never throw.
 */

import { prisma } from '@/lib/db';
import { sendPushNotifications } from '@/lib/push';
import { logger } from '@/lib/logger';

async function getUserPushTokens(userId: string): Promise<string[]> {
  const tokens = await prisma.pushToken.findMany({
    where: { userId },
    select: { token: true },
  });
  return tokens.map((t) => t.token);
}

async function getUserDisplayName(userId: string): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { firstName: true, lastName: true, email: true },
  });
  if (!user) return 'Someone';
  if (user.firstName) return user.firstName;
  return user.email.split('@')[0];
}

/**
 * Notify a post owner that someone liked their post.
 */
export async function notifyLike(postOwnerId: string, likerUserId: string, postId: string): Promise<void> {
  try {
    // Don't notify yourself
    if (postOwnerId === likerUserId) return;

    const likerName = await getUserDisplayName(likerUserId);

    // Create in-app notification
    await prisma.inAppNotification.create({
      data: {
        userId: postOwnerId,
        type: 'like',
        title: 'New Like',
        body: `${likerName} liked your post`,
        data: { postId, fromUserId: likerUserId, screen: 'community' },
      },
    });

    // Send push notification
    const tokens = await getUserPushTokens(postOwnerId);
    if (tokens.length > 0) {
      await sendPushNotifications(tokens, 'New Like', `${likerName} liked your post`, {
        screen: 'community',
        postId,
      });
    }
  } catch (error) {
    logger.error('social-notifications', 'Failed to send like notification', error);
  }
}

/**
 * Notify a post owner that someone commented on their post.
 */
export async function notifyComment(
  postOwnerId: string,
  commenterUserId: string,
  postId: string,
  commentPreview: string
): Promise<void> {
  try {
    if (postOwnerId === commenterUserId) return;

    const commenterName = await getUserDisplayName(commenterUserId);
    const preview = commentPreview.length > 80 ? commentPreview.slice(0, 80) + '...' : commentPreview;

    await prisma.inAppNotification.create({
      data: {
        userId: postOwnerId,
        type: 'comment',
        title: 'New Comment',
        body: `${commenterName}: ${preview}`,
        data: { postId, fromUserId: commenterUserId, screen: 'community' },
      },
    });

    const tokens = await getUserPushTokens(postOwnerId);
    if (tokens.length > 0) {
      await sendPushNotifications(tokens, 'New Comment', `${commenterName}: ${preview}`, {
        screen: 'community',
        postId,
      });
    }
  } catch (error) {
    logger.error('social-notifications', 'Failed to send comment notification', error);
  }
}

/**
 * Notify a user that someone followed them.
 */
export async function notifyFollow(followedUserId: string, followerUserId: string): Promise<void> {
  try {
    if (followedUserId === followerUserId) return;

    const followerName = await getUserDisplayName(followerUserId);

    await prisma.inAppNotification.create({
      data: {
        userId: followedUserId,
        type: 'follow',
        title: 'New Follower',
        body: `${followerName} started following you`,
        data: { fromUserId: followerUserId, screen: 'community' },
      },
    });

    const tokens = await getUserPushTokens(followedUserId);
    if (tokens.length > 0) {
      await sendPushNotifications(tokens, 'New Follower', `${followerName} started following you`, {
        screen: 'community',
        userId: followerUserId,
      });
    }
  } catch (error) {
    logger.error('social-notifications', 'Failed to send follow notification', error);
  }
}

/**
 * Send streak warning notification to a user.
 * Should be called by a daily cron job for users whose last workout was yesterday.
 */
export async function notifyStreakWarning(userId: string, currentStreak: number): Promise<void> {
  try {
    await prisma.inAppNotification.create({
      data: {
        userId,
        type: 'streak_warning',
        title: 'Streak in Danger!',
        body: `Your ${currentStreak}-day streak will end if you don't work out today`,
        data: { screen: 'track', currentStreak },
      },
    });

    const tokens = await getUserPushTokens(userId);
    if (tokens.length > 0) {
      await sendPushNotifications(
        tokens,
        'Streak in Danger!',
        `Your ${currentStreak}-day streak will end if you don't work out today`,
        { screen: 'track' }
      );
    }
  } catch (error) {
    logger.error('social-notifications', 'Failed to send streak warning', error);
  }
}
