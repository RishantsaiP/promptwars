import { NextResponse } from 'next/server';
import { getRepository } from '@/lib/db';

export async function GET() {
  try {
    const repo = getRepository();
    const stats = repo.getPublicStats();
    return NextResponse.json(stats);
  } catch (error) {
    console.error('[API GET /api/stats] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch public statistics.' }, { status: 500 });
  }
}
