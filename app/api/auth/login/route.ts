<<<<<<< HEAD
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyPassword, createSession } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email dan password wajib diisi' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();

    const res = await query<{
      id: number;
      name: string;
      email: string;
      password_hash: string;
      created_at: string;
    }>(
      `SELECT id, name, email, password_hash, created_at FROM users WHERE email = $1`,
      [cleanEmail]
    );

    if (res.rows.length === 0) {
      return NextResponse.json({ error: 'Email atau password salah' }, { status: 401 });
    }

    const user = res.rows[0];

    const isMatch = await verifyPassword(password, user.password_hash);
    if (!isMatch) {
      return NextResponse.json({ error: 'Email atau password salah' }, { status: 401 });
=======
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, createSession } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const email = body?.email?.trim().toLowerCase();
    const password = body?.password;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email dan password wajib diisi." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { email } });

    const genericError = { error: "Email atau password salah." };

    if (!user) {
      return NextResponse.json(genericError, { status: 401 });
    }

    const isValid = await verifyPassword(password, user.password);
    if (!isValid) {
      return NextResponse.json(genericError, { status: 401 });
>>>>>>> feature/auth-session-cookies
    }

    await createSession(user.id);

<<<<<<< HEAD
    return NextResponse.json({
      success: true,
      message: 'Login berhasil!',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        created_at: user.created_at,
      },
    });
  } catch (error: any) {
    console.error('Login API error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server saat login' },
      { status: 500 }
    );
  }
}
=======
    return NextResponse.json(
      { id: user.id, name: user.name, email: user.email },
      { status: 200 }
    );
  } catch (error) {
    console.error("LOGIN_ERROR", error);
    return NextResponse.json({ error: "Terjadi kesalahan pada server." }, { status: 500 });
  }
}
>>>>>>> feature/auth-session-cookies
