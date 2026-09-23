import { cookies } from "next/headers";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

export const SESSION_COOKIE = "session_token";
export const THEME_COOKIE = "theme";

const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 hari
const SALT_ROUNDS = 10;

// ---------- Password ----------
export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

export async function verifyPassword(plain: string, hashed: string): Promise<boolean> {
  return bcrypt.compare(plain, hashed);
}


function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

//Session (disimpan di DB, dirujuk lewat cookie httpOnly)
export async function createSession(userId: string): Promise<string> {
  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

  await prisma.session.create({
    data: { tokenHash, userId, expiresAt },
  });

  const cookieStore = cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true, // tidak bisa diakses lewat JavaScript di browser -> mencegah pencurian via XSS
    secure: process.env.NODE_ENV === "production", // HTTPS only di production
    sameSite: "lax", // mengurangi risiko CSRF
    path: "/",
    expires: expiresAt,
  });

  return token;
}

export async function getCurrentUser() {
  const cookieStore = cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const tokenHash = hashToken(token);
  const session = await prisma.session.findUnique({
    where: { tokenHash },
    include: { user: true },
  });

  if (!session) return null;

  if (session.expiresAt < new Date()) {
    // Sesi kedaluwarsa -> bersihkan dari DB supaya tidak menumpuk
    await prisma.session.delete({ where: { id: session.id } }).catch(() => {});
    return null;
  }

  return session.user;
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    const err = new Error("UNAUTHORIZED");
    err.name = "UNAUTHORIZED";
    throw err;
  }
  return user;
}

export async function destroySession(): Promise<void> {
  const cookieStore = cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (token) {
    const tokenHash = hashToken(token);
    await prisma.session.deleteMany({ where: { tokenHash } });
  }

  cookieStore.delete(SESSION_COOKIE);
}

export type Theme = "light" | "dark";

export function setThemePreference(theme: Theme): void {
  const cookieStore = cookies();
  cookieStore.set(THEME_COOKIE, theme, {
    httpOnly: false, // sengaja bisa dibaca JS di klien untuk toggle instan tanpa refetch
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365, // 1 tahun
  });
}

export function getThemePreference(): Theme {
  const cookieStore = cookies();
  const value = cookieStore.get(THEME_COOKIE)?.value;
  return value === "dark" ? "dark" : "light";
}