// Domain Types for CivicResolve

export const DEPARTMENTS = [
  'Roads & Infrastructure',
  'Sanitation & Solid Waste',
  'Street Lighting & Electricity',
  'Water Supply & Drainage',
  'Traffic & Transport',
  'Parks & Public Spaces',
  'Public Health',
  'General Administration',
] as const;

export type Department = typeof DEPARTMENTS[number];

export const CATEGORIES = [
  'Pothole/Road Damage',
  'Garbage/Overflowing Bin',
  'Streetlight Fault',
  'Water Leakage',
  'Drainage/Sewage Overflow',
  'Damaged Footpath',
  'Traffic Signal/Signage',
  'Fallen Tree/Public Space',
  'Stray Animals/Public Health',
  'Other',
] as const;

export type Category = typeof CATEGORIES[number];

export const PRIORITIES = ['Critical', 'High', 'Medium', 'Low'] as const;
export type Priority = typeof PRIORITIES[number];

export const STATUSES = ['Reported', 'In Progress', 'Resolved'] as const;
export type Status = typeof STATUSES[number];

export const PEOPLE_AFFECTED = ['few', 'many', 'community'] as const;
export type PeopleAffected = typeof PEOPLE_AFFECTED[number];

export const IMAGE_CHECK_VALUES = ['matches', 'mismatch', 'no_image'] as const;
export type ImageCheck = typeof IMAGE_CHECK_VALUES[number];

export interface ImpactFactors {
  safety_risk: number; // 0-10
  people_affected: PeopleAffected;
  near_sensitive_site: boolean;
  worsens_with_time: boolean;
}

export interface TriageResult {
  category: Category;
  sub_issue: string;
  priority: Priority;
  urgency_score: number; // 0-100
  impact_factors: ImpactFactors;
  priority_reasoning: string;
  department: Department;
  department_reasoning: string;
  confidence: number; // 0-1
  suggested_sla_hours: number;
  suggested_title: string;
  cleaned_description_en: string;
  detected_language: string;
  image_check: ImageCheck;
  image_check_note: string;
  possible_spam: boolean;
  recommended_action: string;
  method?: 'ai' | 'rule-based-fallback';
}

export interface StatusEntry {
  id: string;
  issue_id: string;
  status: Status;
  timestamp: string; // ISO 8601
  actor: string; // 'citizen', 'admin', 'system'
  note: string;
}

export interface Issue {
  id: string;
  tracking_code: string; // CR-YYYY-NNNN
  title: string;
  description: string;
  original_language: string;
  latitude: number;
  longitude: number;
  address: string;
  category: Category;
  image_url: string | null; // data URL
  ai_analysis: TriageResult | null;
  // Human overrides (may differ from AI)
  final_category: Category;
  final_department: Department;
  final_priority: Priority;
  status: Status;
  history: StatusEntry[];
  duplicate_of: string | null;
  report_count: number;
  device_id: string | null;
  contact: string | null;
  is_spam: boolean;
  created_at: string; // ISO 8601
  updated_at: string; // ISO 8601
}

export interface CreateIssueInput {
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  address: string;
  category: Category;
  image_url: string | null;
  ai_analysis: TriageResult | null;
  final_category: Category;
  final_department: Department;
  final_priority: Priority;
  device_id: string | null;
  contact: string | null;
}

export interface UpdateIssueInput {
  status?: Status;
  status_note?: string;
  final_category?: Category;
  final_department?: Department;
  final_priority?: Priority;
  is_spam?: boolean;
  resolution_image?: string | null;
}

export interface IssueFilters {
  status?: Status;
  priority?: Priority;
  department?: Department;
  category?: Category;
  search?: string;
  device_id?: string;
  sort_by?: 'urgency_score' | 'created_at' | 'updated_at';
  sort_order?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface DashboardStats {
  total: number;
  reported: number;
  in_progress: number;
  resolved: number;
  critical: number;
  avg_resolution_hours: number;
  ai_agreement_rate: number;
  by_category: Record<string, number>;
  by_department: Record<string, number>;
  by_status: Record<string, number>;
  by_priority: Record<string, number>;
  trend: Array<{ date: string; count: number }>;
}

export interface PublicStats {
  total: number;
  reported: number;
  in_progress: number;
  resolved: number;
}
