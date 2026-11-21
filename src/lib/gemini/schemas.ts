import { z } from 'zod';
import {
  CATEGORIES,
  DEPARTMENTS,
  PRIORITIES,
  PEOPLE_AFFECTED,
  IMAGE_CHECK_VALUES,
} from '../domain/types';

export const impactFactorsSchema = z.object({
  safety_risk: z.number().min(0).max(10),
  people_affected: z.enum(PEOPLE_AFFECTED),
  near_sensitive_site: z.boolean(),
  worsens_with_time: z.boolean(),
});

export const triageResponseSchema = z.object({
  category: z.enum(CATEGORIES),
  sub_issue: z.string(),
  priority: z.enum(PRIORITIES),
  urgency_score: z.number().min(0).max(100),
  impact_factors: impactFactorsSchema,
  priority_reasoning: z.string(),
  department: z.enum(DEPARTMENTS),
  department_reasoning: z.string(),
  confidence: z.number().min(0).max(1),
  suggested_sla_hours: z.number().positive(),
  suggested_title: z.string(),
  cleaned_description_en: z.string(),
  detected_language: z.string(),
  image_check: z.enum(IMAGE_CHECK_VALUES),
  image_check_note: z.string(),
  possible_spam: z.boolean(),
  recommended_action: z.string(),
});

export type TriageResponse = z.infer<typeof triageResponseSchema>;

export function getTriageJsonSchema() {
  return {
    type: 'object' as const,
    properties: {
      category: {
        type: 'string' as const,
        enum: [...CATEGORIES],
        description: 'Primary civic issue classification',
      },
      sub_issue: {
        type: 'string' as const,
        description: 'Specific sub-issue or precise damage description',
      },
      priority: {
        type: 'string' as const,
        enum: [...PRIORITIES],
        description: 'Critical (immediate danger), High (major disruption), Medium (nuisance), Low (cosmetic)',
      },
      urgency_score: {
        type: 'number' as const,
        description: 'Score from 0 to 100 representing urgency',
      },
      impact_factors: {
        type: 'object' as const,
        properties: {
          safety_risk: { type: 'number' as const, description: 'Scale 0 to 10' },
          people_affected: {
            type: 'string' as const,
            enum: [...PEOPLE_AFFECTED],
            description: 'few, many, or community',
          },
          near_sensitive_site: {
            type: 'boolean' as const,
            description: 'Whether issue is near school, hospital, transit hub, or major junction',
          },
          worsens_with_time: {
            type: 'boolean' as const,
            description: 'Whether deterioration accelerates if untreated (e.g. water leak, pothole)',
          },
        },
        required: ['safety_risk', 'people_affected', 'near_sensitive_site', 'worsens_with_time'],
      },
      priority_reasoning: {
        type: 'string' as const,
        description: 'Max 2 plain-language sentences justifying the assigned priority',
      },
      department: {
        type: 'string' as const,
        enum: [...DEPARTMENTS],
        description: 'Recommended municipal department',
      },
      department_reasoning: {
        type: 'string' as const,
        description: 'Brief reason why this department has jurisdiction',
      },
      confidence: {
        type: 'number' as const,
        description: 'AI model confidence score between 0.0 and 1.0',
      },
      suggested_sla_hours: {
        type: 'number' as const,
        description: 'Recommended resolution timeframe in hours (e.g., 6, 12, 24, 48, 72)',
      },
      suggested_title: {
        type: 'string' as const,
        description: 'Clear, concise headline summarizing the problem',
      },
      cleaned_description_en: {
        type: 'string' as const,
        description: 'Cleaned English summary of citizen description',
      },
      detected_language: {
        type: 'string' as const,
        description: 'Language code or name (e.g. English, Hindi, Tamil, Mixed)',
      },
      image_check: {
        type: 'string' as const,
        enum: [...IMAGE_CHECK_VALUES],
        description: 'Whether attached photo matches reported text: matches, mismatch, or no_image',
      },
      image_check_note: {
        type: 'string' as const,
        description: 'Short observation of visual evidence in the photo',
      },
      possible_spam: {
        type: 'boolean' as const,
        description: 'True if citizen text appears nonsensical, abusive, commercial advertising, or irrelevant',
      },
      recommended_action: {
        type: 'string' as const,
        description: 'Concrete instruction for the field crew arriving at site',
      },
    },
    required: [
      'category',
      'sub_issue',
      'priority',
      'urgency_score',
      'impact_factors',
      'priority_reasoning',
      'department',
      'department_reasoning',
      'confidence',
      'suggested_sla_hours',
      'suggested_title',
      'cleaned_description_en',
      'detected_language',
      'image_check',
      'image_check_note',
      'possible_spam',
      'recommended_action',
    ],
  };
}
