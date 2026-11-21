import { NextResponse } from 'next/server';
import { getRepository } from '@/lib/db';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    if (!code) {
      return NextResponse.json({ error: 'Tracking code is required.' }, { status: 400 });
    }

    const repo = getRepository();
    const issue = repo.getByTrackingCode(code);

    if (!issue) {
      return NextResponse.json(
        { error: `No issue found with tracking code ${code}. Please verify and retry.` },
        { status: 404 }
      );
    }

    return NextResponse.json(issue);
  } catch (error) {
    console.error('[API GET /api/issues/track/[code]] Error:', error);
    return NextResponse.json({ error: 'Failed to look up tracking code.' }, { status: 500 });
  }
}
