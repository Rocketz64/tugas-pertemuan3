import { NextResponse } from 'next/server';
import { setThemePreference } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { theme } = body;

    if (theme !== 'light' && theme !== 'dark') {
      return NextResponse.json({ error: 'Nilai tema tidak valid' }, { status: 400 });
    }

    await setThemePreference(theme);

    return NextResponse.json({
      success: true,
      theme,
      message: `Preferensi tema berhasil diubah ke ${theme}`,
    });
  } catch (error) {
    console.error('Error setting theme cookie preference:', error);
    return NextResponse.json({ error: 'Gagal menyimpan preferensi tema' }, { status: 500 });
  }
}
