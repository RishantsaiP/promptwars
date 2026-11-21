import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getRepository } from '@/lib/db';
import { isAdminAuthenticated } from '@/lib/auth/admin';
import { CATEGORIES, DEPARTMENTS, PRIORITIES, STATUSES } from '@/lib/domain/types';

const updateIssueSchema = z.object({
  status: z.enum(STATUSES).optional(),
  status_note: z.string().optional(),
  final_category: z.enum(CATEGORIES).optional(),
  final_department: z.enum(DEPARTMENTS).optional(),
  final_priority: z.enum(PRIORITIES).optional(),
  is_spam: z.boolean().optional(),
  resolution_image: z.string().nullable().optional(),
  actor: z.string().default('admin'),
});

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const repo = getRepository();
    const issue = repo.getById(id);

    if (!issue) {
      return NextResponse.json({ error: 'Issue not found.' }, { status: 404 });
    }

    return NextResponse.json(issue);
  } catch (error) {
    console.error('[API GET /api/issues/[id]] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch issue.' }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAuth = await isAdminAuthenticated();
    if (!isAuth) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin credentials required to modify issues.' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await req.json();
    const validation = updateIssueSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid update payload', details: validation.error.format() },
        { status: 400 }
      );
    }

    const { actor, ...updateData } = validation.data;
    const repo = getRepository();
    const updated = repo.update(id, updateData, actor);

    if (!updated) {
      return NextResponse.json({ error: 'Issue not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, issue: updated });
  } catch (error) {
    console.error('[API PATCH /api/issues/[id]] Error:', error);
    return NextResponse.json({ error: 'Failed to update issue.' }, { status: 500 });
  }
}
