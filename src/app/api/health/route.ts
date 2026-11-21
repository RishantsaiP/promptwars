import { NextResponse } from 'next/server';
import { getRepository, getActiveStoreType } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const repo = getRepository();
    const stats = repo.getStats();

    return NextResponse.json({
      status: 'ok',
      store: getActiveStoreType(),
      uptime_seconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
      database: {
        active_store: getActiveStoreType(),
        status: 'connected',
        total_issues: stats.total,
        open_issues: stats.reported + stats.in_progress,
      },
      environment: process.env.NODE_ENV || 'development',
      gemini: {
        configured: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim()),
        model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Health check failed';
    return NextResponse.json(
      {
        status: 'error',
        error: msg,
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
