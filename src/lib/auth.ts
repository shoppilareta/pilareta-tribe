import { NextRequest } from 'next/server';
import { getSession as getIronSession, type SessionData } from './session';
import { prisma } from './db';

export interface AuthSession {
  userId: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  isAdmin: boolean;
}

/**
 * Get the current user session with admin status.
 * Supports both cookie-based auth (web) and Bearer token auth (mobile).
 *
 * @param request - Optional NextRequest for Bearer token auth (mobile)
 */
export async function getSession(request?: NextRequest): Promise<AuthSession | null> {
  // Try Bearer token first (mobile app)
  if (request) {
    const authHeader = request.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.slice(7);
      const dbSession = await prisma.session.findFirst({
        where: {
          accessToken: token,
          expiresAt: { gt: new Date() },
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              isAdmin: true,
            },
          },
        },
      });

      if (dbSession) {
        return {
          userId: dbSession.user.id,
          email: dbSession.user.email,
          firstName: dbSession.user.firstName ?? undefined,
          lastName: dbSession.user.lastName ?? undefined,
          isAdmin: dbSession.user.isAdmin,
        };
      }
      // Bearer token invalid/expired - don't fall through to cookie
      return null;
    }
  }

  // Fall back to iron-session cookie (web)
  const session = await getIronSession();

  if (!session.userId) {
    return null;
  }

  // Get admin status from database
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { isAdmin: true },
  });

  return {
    userId: session.userId,
    email: session.email,
    firstName: session.firstName,
    lastName: session.lastName,
    isAdmin: user?.isAdmin || false,
  };
}

/**
 * Check if user is logged in
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await getIronSession();
  return !!session.userId;
}

/**
 * Check if user is an admin
 */
export async function isAdmin(): Promise<boolean> {
  const session = await getSession();
  return session?.isAdmin || false;
}
