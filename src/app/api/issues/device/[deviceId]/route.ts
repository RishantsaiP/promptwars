import { NextResponse } from 'next/server';
import { getRepository } from '@/lib/db';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ deviceId: string }> }
) {
  try {
    const { deviceId } = await params;
    if (!deviceId) {
      return NextResponse.json({ error: 'Device ID parameter required.' }, { status: 400 });
    }

    const repo = getRepository();
    const userIssues = repo.getByDeviceId(deviceId);

    return NextResponse.json({ issues: userIssues });
  } catch (error) {
    console.error('[API GET /api/issues/device/[deviceId]] Error:', error);
    return NextResponse.json({ error: 'Failed to retrieve device issues.' }, { status: 500 });
  }
}
