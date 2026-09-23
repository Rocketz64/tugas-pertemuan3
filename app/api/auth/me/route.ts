import { NextResponse } from 'next/server';
import { getSessionUser, getThemePreference } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getSessionUser();
    const theme = await getThemePreference();

    if (!user) {
      return NextResponse.json({ authenticated: false, user: null, theme });
    }

    return NextResponse.json({
      authenticated: true,
      user,
      theme,
    });
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json({ authenticated: false, user: null }, { status: 500 });
  }
}
