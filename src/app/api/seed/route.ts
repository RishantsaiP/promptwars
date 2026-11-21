import { NextResponse } from 'next/server';
import { getRepository } from '@/lib/db';
import { isAdminAuthenticated, isDemoMode } from '@/lib/auth/admin';

export async function POST() {
  try {
    const isAuth = await isAdminAuthenticated();
    if (!isAuth && !isDemoMode()) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const repo = getRepository();
    repo.reset();

    return NextResponse.json({
      success: true,
      message: 'Demo dataset reset successfully to 25 realistic Coimbatore civic issues.',
    });
  } catch (error) {
    console.error('[API /api/seed] Reset error:', error);
    return NextResponse.json({ error: 'Failed to reset demo dataset.' }, { status: 500 });
  }
}
