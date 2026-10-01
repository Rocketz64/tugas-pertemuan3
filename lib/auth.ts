import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs'; // untuk mengamankan password
import crypto from 'crypto'; // untuk membuat id sesi
import { query } from './db';

export interface SafeUser {
  id: number;
  name: string;
  email: string;
  created_at: string;
}

export const SESSION_COOKIE = 'session_id';
export const SESSION_COOKIE_NAME = SESSION_COOKIE;
export const THEME_COOKIE = 'theme';
export const THEME_COOKIE_NAME = THEME_COOKIE;
export const SESSION_EXPIRY_DAYS = 7;

export type Theme = 'light' | 'dark';

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createSession(userId: number | string): Promise<string> {
  const sessionId = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + SESSION_EXPIRY_DAYS);

  await query(
    `INSERT INTO sessions (id, user_id, expires_at) VALUES ($1, $2, $3)`,
    [sessionId, Number(userId), expiresAt]
  );

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: expiresAt,
  });

  return sessionId;
}

export async function getSessionUser(): Promise<SafeUser | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE);
    if (!sessionCookie?.value) {
      return null;
    }

    const sessionId = sessionCookie.value;

    const res = await query<SafeUser>(
      `SELECT u.id, u.name, u.email, u.created_at
       FROM sessions s
       JOIN users u ON s.user_id = u.id
       WHERE s.id = $1 AND s.expires_at > NOW()`,
      [sessionId]
    );

    if (res.rows.length === 0) {
      cookieStore.delete(SESSION_COOKIE);
      return null;
    }

    return res.rows[0];
  } catch (error: any) {
    if (error?.digest === 'DYNAMIC_SERVER_USAGE') {
      throw error;
    }
    console.error('Error fetching session user:', error);
    return null;
  }
}

export async function getCurrentUser(): Promise<SafeUser | null> {
  return getSessionUser();
}

export async function requireUser(): Promise<SafeUser> {
  const user = await getCurrentUser();
  if (!user) {
    const err = new Error('UNAUTHORIZED');
    err.name = 'UNAUTHORIZED';
    throw err;
  }
  return user;
}

export async function destroySession(): Promise<void> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE);
    if (sessionCookie?.value) {
      await query(`DELETE FROM sessions WHERE id = $1`, [sessionCookie.value]);
      cookieStore.delete(SESSION_COOKIE);
    }
  } catch (error) {
    console.error('Error destroying session:', error);
  }
}

export async function getThemePreference(): Promise<Theme> {
  try {
    const cookieStore = await cookies();
    const themeCookie = cookieStore.get(THEME_COOKIE);
    return themeCookie?.value === 'dark' ? 'dark' : 'light';
  } catch (error: any) {
    if (error?.digest === 'DYNAMIC_SERVER_USAGE') {
      throw error;
    }
    return 'light';
  }
}

export async function setThemePreference(theme: Theme): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(THEME_COOKIE, theme, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  });
}