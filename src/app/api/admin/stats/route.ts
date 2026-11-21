import { NextResponse } from 'next/server';
import { getRepository } from '@/lib/db';
import { isAdminAuthenticated } from '@/lib/auth/admin';

export async function GET() {
  try {
    const isAuth = await isAdminAuthenticated();
    if (!isAuth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const repo = getRepository();
    const stats = repo.getStats();
    return NextResponse.json(stats);
  } catch (error) {
    console.error('[API GET /api/admin/stats] Error:', error);
    return NextResponse.json({ error: 'Failed to compute dashboard stats.' }, { status: 500 });
  }
}
