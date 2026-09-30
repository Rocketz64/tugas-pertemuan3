import { NextResponse } from 'next/server';
import { destroySession } from '@/lib/auth';

export async function POST() {
  try {
    await destroySession();
    return NextResponse.json({ success: true, message: 'Logout berhasil', ok: true });
  } catch (error: any) {
    console.error('Logout API error:', error);
    return NextResponse.json({ error: 'Gagal melakukan logout' }, { status: 500 });
  }
}
