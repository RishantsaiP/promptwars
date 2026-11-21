import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const SECRET = new TextEncoder().encode(
  (process.env.SESSION_SECRET || 'civic-resolve-secret-key-at-least-32-chars-long').padEnd(32, '#')
);

async function verifyToken(token: string | undefined, requiredRole: string): Promise<boolean> {
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload.role === requiredRole;
  } catch {
    return false;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ── Protect /admin/* (except /admin/login itself) ──────────────────────────
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const token = req.cookies.get('civic_admin_session')?.value;
    const isAdmin = await verifyToken(token, 'admin');
    if (!isAdmin) {
      return NextResponse.redirect(new URL('/admin/login', req.url));
    }
  }

  // ── Protect /api/admin/* (except /api/admin/login) ─────────────────────────
  if (pathname.startsWith('/api/admin') && !pathname.startsWith('/api/admin/login')) {
    const token = req.cookies.get('civic_admin_session')?.value;
    const isAdmin = await verifyToken(token, 'admin');
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  // Run on admin pages + admin API; skip static assets and _next
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
