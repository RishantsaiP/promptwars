import { NextResponse } from 'next/server';
import { verifyCivilianSession, getUserById } from '@/lib/auth/civilian';

export async function GET() {
  const session = await verifyCivilianSession();
  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
  const user = getUserById(session.userId);
  if (!user) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
  return NextResponse.json({ authenticated: true, user });
}
