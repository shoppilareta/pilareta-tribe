import { getIronSession, SessionOptions, IronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { SESSION_MAX_AGE_SECONDS } from '@/lib/constants';

export interface SessionData {
  userId?: string;
  shopifyAccessToken?: string;
  shopifyCustomerId?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  codeVerifier?: string;
  state?: string;
  idToken?: string;
  redirectTo?: string;
}

if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 32) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('SESSION_SECRET environment variable must be set and at least 32 characters in production');
  }
}

const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET || 'dev_only_session_secret_not_for_production_use_32chars',
  cookieName: 'pilareta-tribe-session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax' as const,
    maxAge: SESSION_MAX_AGE_SECONDS, // 7 days
  },
};

export async function getSession(): Promise<IronSession<SessionData>> {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore, sessionOptions);
}

export async function destroySession() {
  const session = await getSession();
  session.destroy();
}
