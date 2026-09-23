import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { hashPassword, createSession } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Nama wajib diisi' }, { status: 400 });
    }

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: 'Format email tidak valid' }, { status: 400 });
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      return NextResponse.json({ error: 'Password minimal 6 karakter' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();

    const existing = await query('SELECT id FROM users WHERE email = $1', [cleanEmail]);
    if (existing.rows.length > 0) {
      return NextResponse.json({ error: 'Email sudah terdaftar. Silakan login.' }, { status: 409 });
    }

    const hashedPassword = await hashPassword(password);

    const insertRes = await query<{ id: number; name: string; email: string; created_at: string }>(
      `INSERT INTO users (name, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, name, email, created_at`,
      [name.trim(), cleanEmail, hashedPassword]
    );

    const user = insertRes.rows[0];

    await createSession(user.id);

    return NextResponse.json({
      success: true,
      message: 'Registrasi berhasil!',
      user,
    });
  } catch (error: any) {
    console.error('Register API error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server saat registrasi' },
      { status: 500 }
    );
  }
}
