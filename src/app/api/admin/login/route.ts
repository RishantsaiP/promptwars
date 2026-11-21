import { NextResponse } from 'next/server';
import {
  createAdminSessionToken,
  getAdminPassword,
  SESSION_COOKIE_NAME,
  isDemoMode,
} from '@/lib/auth/admin';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const body = await req.json();
    const { password, action } = body;

    // Handle logout action
    if (action === 'logout') {
      const response = NextResponse.json({ success: true, message: 'Logged out successfully.' });
      response.cookies.set(SESSION_COOKIE_NAME, '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 0,
      });
      return response;
    }

    // Rate limit: max 10 admin login attempts per minute per IP
    const isAllowed = checkRateLimit(`admin:login:${ip}`, 10, 60000);
    if (!isAllowed) {
      return NextResponse.json(
        { error: 'Too many admin sign-in attempts. Please wait a minute and try again.' },
        { status: 429 }
      );
    }

    const expectedPassword = getAdminPassword();
    const isValid = password === expectedPassword || (isDemoMode() && password === 'demo');

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid admin credentials. Please enter the correct password.' },
        { status: 401 }
      );
    }

    const token = await createAdminSessionToken();
    const response = NextResponse.json({ success: true, message: 'Admin authenticated.' });

    response.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    console.error('[API /api/admin/login] Error:', error);
    return NextResponse.json({ error: 'Server authentication failure.' }, { status: 500 });
  }
}
