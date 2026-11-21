/**
 * Civilian user authentication helpers.
 * Stores users in data/users.json (atomic writes via temp-file+rename).
 * Passwords hashed with bcryptjs (12 rounds).
 * Sessions issued as signed JWTs stored in an httpOnly, Secure, SameSite=Lax cookie.
 */
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';

export const CIVILIAN_SESSION_COOKIE = 'civic_user_session';
const isVercel = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
const USERS_FILE = isVercel ? path.join('/tmp', 'data', 'users.json') : path.resolve(process.cwd(), 'data', 'users.json');

export interface CivilianUser {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  createdAt: string;
}

// ─── user store (atomic) ────────────────────────────────────────────────────

function readUsers(): CivilianUser[] {
  try {
    const raw = fs.readFileSync(USERS_FILE, 'utf-8');
    return JSON.parse(raw) as CivilianUser[];
  } catch {
    return [];
  }
}

function writeUsers(users: CivilianUser[]): void {
  const dir = path.dirname(USERS_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const tmp = USERS_FILE + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(users, null, 2), 'utf-8');
  fs.renameSync(tmp, USERS_FILE);
}

// ─── register ───────────────────────────────────────────────────────────────

export async function registerCivilianUser(
  email: string,
  password: string,
  name: string
): Promise<Omit<CivilianUser, 'passwordHash'>> {
  const users = readUsers();
  const normalised = email.trim().toLowerCase();
  if (users.find((u) => u.email === normalised)) {
    throw new Error('An account with that e-mail already exists.');
  }
  const passwordHash = await bcrypt.hash(password, 12);
  const user: CivilianUser = {
    id: randomUUID(),
    email: normalised,
    name: name.trim(),
    passwordHash,
    createdAt: new Date().toISOString(),
  };
  writeUsers([...users, user]);
  return { id: user.id, email: user.email, name: user.name, createdAt: user.createdAt };
}

// ─── login ──────────────────────────────────────────────────────────────────

export async function loginCivilianUser(
  email: string,
  password: string
): Promise<Omit<CivilianUser, 'passwordHash'>> {
  const users = readUsers();
  const user = users.find((u) => u.email === email.trim().toLowerCase());
  // constant-time-ish: always compare even if user not found
  const dummyHash = '$2a$12$aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
  const match = await bcrypt.compare(password, user?.passwordHash ?? dummyHash);
  if (!user || !match) {
    throw new Error('Invalid email or password.');
  }
  return { id: user.id, email: user.email, name: user.name, createdAt: user.createdAt };
}

export function getUserById(id: string): Omit<CivilianUser, 'passwordHash'> | null {
  const users = readUsers();
  const user = users.find((u) => u.id === id);
  if (!user) return null;
  return { id: user.id, email: user.email, name: user.name, createdAt: user.createdAt };
}

// ─── JWT ────────────────────────────────────────────────────────────────────

function getSecretKey(): Uint8Array {
  const secret = process.env.SESSION_SECRET || 'civic-resolve-secret-key-at-least-32-chars-long';
  return new TextEncoder().encode(secret.padEnd(32, '#'));
}

export async function createCivilianSessionToken(userId: string): Promise<string> {
  return new SignJWT({ sub: userId, role: 'civilian' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getSecretKey());
}

export async function verifyCivilianSession(): Promise<{
  userId: string;
  role: string;
} | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(CIVILIAN_SESSION_COOKIE)?.value;
    if (!token) return null;
    const { payload } = await jwtVerify(token, getSecretKey());
    if (!payload.sub || payload.role !== 'civilian') return null;
    return { userId: payload.sub as string, role: 'civilian' };
  } catch {
    return null;
  }
}
