import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getRepository } from '@/lib/db';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { CATEGORIES, DEPARTMENTS, PRIORITIES, STATUSES } from '@/lib/domain/types';
import { triageResponseSchema } from '@/lib/gemini/schemas';

const createIssueSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().min(5).max(3000),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  address: z.string().min(2).max(500),
  category: z.enum(CATEGORIES),
  image_url: z.string().nullable().optional(),
  ai_analysis: triageResponseSchema.nullable().optional(),
  final_category: z.enum(CATEGORIES),
  final_department: z.enum(DEPARTMENTS),
  final_priority: z.enum(PRIORITIES),
  device_id: z.string().nullable().optional(),
  contact: z.string().nullable().optional(),
});

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const repo = getRepository();

    const statusParam = searchParams.get('status');
    const priorityParam = searchParams.get('priority');
    const departmentParam = searchParams.get('department');
    const categoryParam = searchParams.get('category');
    const searchParam = searchParams.get('search');
    const deviceIdParam = searchParams.get('device_id');
    const sortByParam = searchParams.get('sort_by');
    const sortOrderParam = searchParams.get('sort_order');
    const limitParam = searchParams.get('limit');
    const offsetParam = searchParams.get('offset');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filters: any = {};
    if (statusParam && STATUSES.includes(statusParam as any)) filters.status = statusParam;
    if (priorityParam && PRIORITIES.includes(priorityParam as any)) filters.priority = priorityParam;
    if (departmentParam && DEPARTMENTS.includes(departmentParam as any)) filters.department = departmentParam;
    if (categoryParam && CATEGORIES.includes(categoryParam as any)) filters.category = categoryParam;
    if (searchParam) filters.search = searchParam;
    if (deviceIdParam) filters.device_id = deviceIdParam;
    if (sortByParam) filters.sort_by = sortByParam;
    if (sortOrderParam) filters.sort_order = sortOrderParam;
    if (limitParam) filters.limit = Math.min(100, Math.max(1, parseInt(limitParam, 10)));
    if (offsetParam) filters.offset = Math.max(0, parseInt(offsetParam, 10));

    const result = repo.list(filters);
    return NextResponse.json(result);
  } catch (error) {
    console.error('[API GET /api/issues] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch issues.' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const isAllowed = checkRateLimit(`submit:${ip}`, 15, 60000);
    if (!isAllowed) {
      return NextResponse.json(
        { error: 'Submission rate limit reached. Please wait a minute.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const validation = createIssueSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.format() },
        { status: 400 }
      );
    }

    const input = validation.data;
    const repo = getRepository();

    // Duplicate detection: open issues within 100 meters, same category, last 14 days
    const nearbyDuplicates = repo.findNearby(
      input.latitude,
      input.longitude,
      100, // 100 meters radius
      input.final_category,
      14 // 14 days back
    );

    let isDuplicate = false;
    let linkedParentCode: string | null = null;
    let parentIssueId: string | null = null;

    if (nearbyDuplicates.length > 0) {
      // Found an existing nearby issue of the same category
      const primaryParent = nearbyDuplicates[0];
      parentIssueId = primaryParent.id;
      linkedParentCode = primaryParent.tracking_code;
      isDuplicate = true;
      repo.incrementReportCount(primaryParent.id);
    }

    // Create the new issue record
    const createdIssue = repo.create({
      title: input.title,
      description: input.description,
      latitude: input.latitude,
      longitude: input.longitude,
      address: input.address,
      category: input.category,
      image_url: input.image_url || null,
      ai_analysis: input.ai_analysis || null,
      final_category: input.final_category,
      final_department: input.final_department,
      final_priority: input.final_priority,
      device_id: input.device_id || null,
      contact: input.contact || null,
    });

    if (isDuplicate && parentIssueId) {
      repo.linkDuplicate(createdIssue.id, parentIssueId);
    }

    return NextResponse.json(
      {
        success: true,
        issue: createdIssue,
        is_duplicate: isDuplicate,
        linked_parent_code: linkedParentCode,
        message: isDuplicate
          ? `Similar issue already reported nearby (${linkedParentCode}). Your report has been linked to escalate municipal attention.`
          : 'Issue successfully reported.',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[API POST /api/issues] Error:', error);
    return NextResponse.json({ error: 'Failed to create issue.' }, { status: 500 });
  }
}
