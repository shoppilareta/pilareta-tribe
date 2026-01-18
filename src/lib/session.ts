import { getIronSession, SessionOptions, IronSession } from 'iron-session';
import { cookies } from 'next/headers';

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
}

const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET || 'complex_password_at_least_32_characters_long',
  cookieName: 'pilareta-tribe-session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax' as const,
    maxAge: 60 * 60 * 24 * 7, // 1 week
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
