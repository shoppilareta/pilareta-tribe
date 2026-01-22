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
 * Get the current user session with admin status
 */
export async function getSession(): Promise<AuthSession | null> {
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
