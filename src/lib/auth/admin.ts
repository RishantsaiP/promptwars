import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const SESSION_COOKIE_NAME = 'civic_admin_session';

function getSecretKey(): Uint8Array {
  const secret = process.env.SESSION_SECRET || 'civic-resolve-secret-key-at-least-32-chars-long';
  return new TextEncoder().encode(secret.padEnd(32, '#'));
}

export function getAdminPassword(): string {
  return process.env.ADMIN_PASSWORD || 'coimbatore2026';
}

export function isDemoMode(): boolean {
  return process.env.DEMO_MODE === 'true' || !process.env.DEMO_MODE;
}

export async function createAdminSessionToken(): Promise<string> {
  const secret = getSecretKey();
  return await new SignJWT({ role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret);
}

export async function verifyAdminSessionToken(token: string): Promise<boolean> {
  try {
    const secret = getSecretKey();
    const { payload } = await jwtVerify(token, secret);
    return payload.role === 'admin';
  } catch {
    return false;
  }
}

export async function isAdminAuthenticated(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
    if (!sessionCookie || !sessionCookie.value) {
      return false;
    }
    return await verifyAdminSessionToken(sessionCookie.value);
  } catch {
    return false;
  }
}

export { SESSION_COOKIE_NAME };
