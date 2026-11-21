import type {
  Issue,
  CreateIssueInput,
  UpdateIssueInput,
  IssueFilters,
  DashboardStats,
  PublicStats,
  Category,
} from '../domain/types';

export interface IssueRepository {
  /** Create the schema / storage and seed with sample data if empty. */
  initialize(): void;

  /** Create a new issue from citizen input. */
  create(input: CreateIssueInput): Issue;

  /** Retrieve an issue by its UUID. */
  getById(id: string): Issue | null;

  /** Retrieve an issue by its human-readable tracking code (CR-YYYY-NNNN). */
  getByTrackingCode(code: string): Issue | null;

  /** List issues with filtering, search, sorting, and pagination. */
  list(filters: IssueFilters): { issues: Issue[]; total: number };

  /** Update an issue's status, category overrides, spam flag, etc. */
  update(id: string, input: UpdateIssueInput, actor: string): Issue | null;

  /** Find issues within a radius of a point, filtered by category and recency. */
  findNearby(
    lat: number,
    lng: number,
    radiusMeters: number,
    category: Category,
    daysBack: number,
  ): Issue[];

  /** Increment the report_count for an issue (another citizen reported the same thing). */
  incrementReportCount(id: string): void;

  /** Mark childId as a duplicate of parentId. */
  linkDuplicate(childId: string, parentId: string): void;

  /** Compute dashboard statistics for the admin panel. */
  getStats(): DashboardStats;

  /** Compute public-facing statistics (counts only). */
  getPublicStats(): PublicStats;

  /** Get all issues reported by a specific device. */
  getByDeviceId(deviceId: string): Issue[];

  /** Get the total count of issues. */
  getCount(): number;

  /** Reset all data (for demo / testing). */
  reset(): void;
}
