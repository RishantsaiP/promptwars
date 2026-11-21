import { NextResponse } from 'next/server';
import {
  registerCivilianUser,
  createCivilianSessionToken,
  CIVILIAN_SESSION_COOKIE,
} from '@/lib/auth/civilian';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    // Rate limit: max 5 registrations per 5 minutes per IP
    const isAllowed = checkRateLimit(`auth:register:${ip}`, 5, 300000);
    if (!isAllowed) {
      return NextResponse.json(
        { error: 'Too many registration requests. Please wait a few minutes before trying again.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { email, password, name } = body;

    if (!email || !password || !name) {
      return NextResponse.json({ error: 'Name, email, and password are required.' }, { status: 400 });
    }
    if (typeof password !== 'string' || password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 });
    }
    // Basic email format check
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Invalid email address.' }, { status: 400 });
    }

    const user = await registerCivilianUser(email, password, name);
    const token = await createCivilianSessionToken(user.id);

    const response = NextResponse.json(
      { success: true, user: { id: user.id, email: user.email, name: user.name } },
      { status: 201 }
    );

    response.cookies.set(CIVILIAN_SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Registration failed.';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
