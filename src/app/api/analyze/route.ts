import { NextResponse } from 'next/server';
import { z } from 'zod';
import { analyzeIssueWithGemini } from '@/lib/gemini/triage';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

const analyzeRequestSchema = z.object({
  description: z.string().default(''),
  title: z.string().optional(),
  image: z.string().nullable().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const isAllowed = checkRateLimit(`analyze:${ip}`, 20, 60000);
    if (!isAllowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please wait a minute before requesting another AI analysis.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parseResult = analyzeRequestSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid input parameters', details: parseResult.error.format() },
        { status: 400 }
      );
    }

    const { description, title, image, latitude, longitude } = parseResult.data;

    // Validate that at least some text or an image is present
    if (!description.trim() && !image) {
      return NextResponse.json(
        { error: 'Please provide either an issue description or upload a photo.' },
        { status: 400 }
      );
    }

    // Validate image format and size if present (≤ 5MB data URL)
    if (image) {
      if (!image.startsWith('data:image/')) {
        return NextResponse.json(
          { error: 'Invalid image format. Must be an image data URL.' },
          { status: 400 }
        );
      }
      // rough byte size check for base64: length * 0.75
      const approximateBytes = image.length * 0.75;
      if (approximateBytes > 5 * 1024 * 1024) {
        return NextResponse.json(
          { error: 'Image size exceeds maximum limit of 5 MB.' },
          { status: 400 }
        );
      }
    }

    const triageResult = await analyzeIssueWithGemini({
      description,
      title,
      imageUrl: image,
      latitude,
      longitude,
    });

    return NextResponse.json({
      success: true,
      analysis: triageResult,
    });
  } catch (error) {
    console.error('[API /api/analyze] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error processing analysis.' },
      { status: 500 }
    );
  }
}
