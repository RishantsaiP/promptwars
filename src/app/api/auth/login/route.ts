import { NextResponse } from 'next/server';
import {
  loginCivilianUser,
  createCivilianSessionToken,
  CIVILIAN_SESSION_COOKIE,
} from '@/lib/auth/civilian';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const body = await req.json();
    const { email, password, action } = body;

    // Handle logout
    if (action === 'logout') {
      const response = NextResponse.json({ success: true });
      response.cookies.set(CIVILIAN_SESSION_COOKIE, '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 0,
      });
      return response;
    }

    // Rate limit: max 10 attempts per minute per IP
    const isAllowed = checkRateLimit(`auth:login:${ip}`, 10, 60000);
    if (!isAllowed) {
      return NextResponse.json(
        { error: 'Too many login attempts. Please wait a minute and try again.' },
        { status: 429 }
      );
    }

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
    }

    const user = await loginCivilianUser(email, password);
    const token = await createCivilianSessionToken(user.id);

    const response = NextResponse.json({
      success: true,
      user: { id: user.id, email: user.email, name: user.name },
    });

    response.cookies.set(CIVILIAN_SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Login failed.';
    // Always return 401 for bad credentials (don't leak whether user exists)
    return NextResponse.json({ error: msg }, { status: 401 });
  }
}
