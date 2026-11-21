import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import type {
  Issue,
  CreateIssueInput,
  UpdateIssueInput,
  IssueFilters,
  DashboardStats,
  PublicStats,
  Category,
  StatusEntry,
  Priority,
} from '../domain/types';
import type { IssueRepository } from './repository';
import { generateTrackingCode } from '../domain/tracking-code';
import { getSeedIssues } from './seed';

function haversineDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // metres
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

export class JsonFileRepository implements IssueRepository {
  private dataDir: string;
  private filePath: string;
  private memoryCache: Issue[] | null = null;
  private lastMtimeMs: number = 0;

  constructor() {
    const isVercel = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
    this.dataDir = isVercel ? path.join('/tmp', 'data') : path.join(process.cwd(), 'data');
    this.filePath = path.join(this.dataDir, 'issues.json');
  }

  private ensureFile(): void {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
    if (!fs.existsSync(this.filePath)) {
      fs.writeFileSync(this.filePath, JSON.stringify([], null, 2), 'utf-8');
    }
  }

  private readAll(): Issue[] {
    this.ensureFile();
    try {
      const stat = fs.statSync(this.filePath);
      if (this.memoryCache && stat.mtimeMs === this.lastMtimeMs) {
        return this.memoryCache;
      }
      const raw = fs.readFileSync(this.filePath, 'utf-8');
      this.memoryCache = JSON.parse(raw);
      this.lastMtimeMs = stat.mtimeMs;
      return this.memoryCache || [];
    } catch (err) {
      console.error('[JsonStore] Error reading file, resetting cache:', err);
      return this.memoryCache || [];
    }
  }

  private writeAll(issues: Issue[]): void {
    this.ensureFile();
    fs.writeFileSync(this.filePath, JSON.stringify(issues, null, 2), 'utf-8');
    try {
      const stat = fs.statSync(this.filePath);
      this.lastMtimeMs = stat.mtimeMs;
    } catch {
      // ignore stat error
    }
    this.memoryCache = issues;
  }

  public initialize(): void {
    this.ensureFile();
    const existing = this.readAll();
    if (existing.length === 0) {
      console.log('[JsonStore] Initializing with 25 seed issues...');
      const seedIssues = getSeedIssues();
      this.writeAll(seedIssues);
    }
  }

  public getCount(): number {
    return this.readAll().length;
  }

  public create(input: CreateIssueInput): Issue {
    const issues = this.readAll();
    const now = new Date().toISOString();
    const id = uuidv4();
    const trackingCode = generateTrackingCode(issues.length);

    const initialHistory: StatusEntry = {
      id: uuidv4(),
      issue_id: id,
      status: 'Reported',
      timestamp: now,
      actor: 'citizen',
      note: 'Issue reported by citizen.',
    };

    const newIssue: Issue = {
      id,
      tracking_code: trackingCode,
      title: input.title,
      description: input.description,
      original_language: input.ai_analysis?.detected_language || 'en',
      latitude: input.latitude,
      longitude: input.longitude,
      address: input.address,
      category: input.category,
      image_url: input.image_url,
      ai_analysis: input.ai_analysis,
      final_category: input.final_category,
      final_department: input.final_department,
      final_priority: input.final_priority,
      status: 'Reported',
      history: [initialHistory],
      duplicate_of: null,
      report_count: 1,
      device_id: input.device_id,
      contact: input.contact,
      is_spam: false,
      created_at: now,
      updated_at: now,
    };

    issues.unshift(newIssue);
    this.writeAll(issues);
    return newIssue;
  }

  public getById(id: string): Issue | null {
    const issues = this.readAll();
    return issues.find((i) => i.id === id) || null;
  }

  public getByTrackingCode(code: string): Issue | null {
    const issues = this.readAll();
    const formatted = code.trim().toUpperCase();
    return issues.find((i) => i.tracking_code.toUpperCase() === formatted) || null;
  }

  public list(filters: IssueFilters): { issues: Issue[]; total: number } {
    let result = [...this.readAll()];

    if (filters.status) {
      result = result.filter((i) => i.status === filters.status);
    }
    if (filters.priority) {
      result = result.filter((i) => i.final_priority === filters.priority);
    }
    if (filters.department) {
      result = result.filter((i) => i.final_department === filters.department);
    }
    if (filters.category) {
      result = result.filter((i) => i.final_category === filters.category);
    }
    if (filters.device_id) {
      result = result.filter((i) => i.device_id === filters.device_id);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase().trim();
      result = result.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          i.description.toLowerCase().includes(q) ||
          i.address.toLowerCase().includes(q) ||
          i.tracking_code.toLowerCase().includes(q)
      );
    }

    const sortBy = filters.sort_by || 'urgency_score';
    const sortOrder = filters.sort_order || 'desc';

    result.sort((a, b) => {
      let valA: number;
      let valB: number;

      if (sortBy === 'urgency_score') {
        valA = a.ai_analysis?.urgency_score ?? (a.final_priority === 'Critical' ? 90 : a.final_priority === 'High' ? 70 : a.final_priority === 'Medium' ? 40 : 20);
        valB = b.ai_analysis?.urgency_score ?? (b.final_priority === 'Critical' ? 90 : b.final_priority === 'High' ? 70 : b.final_priority === 'Medium' ? 40 : 20);
      } else if (sortBy === 'updated_at') {
        valA = new Date(a.updated_at).getTime();
        valB = new Date(b.updated_at).getTime();
      } else {
        valA = new Date(a.created_at).getTime();
        valB = new Date(b.created_at).getTime();
      }

      return sortOrder === 'desc' ? valB - valA : valA - valB;
    });

    const total = result.length;
    const offset = filters.offset || 0;
    const limit = filters.limit || 50;
    const paginated = result.slice(offset, offset + limit);

    return { issues: paginated, total };
  }

  public update(id: string, input: UpdateIssueInput, actor: string): Issue | null {
    const issues = this.readAll();
    const index = issues.findIndex((i) => i.id === id);
    if (index === -1) return null;

    const issue = issues[index];
    const now = new Date().toISOString();

    if (input.status && input.status !== issue.status) {
      issue.status = input.status;
      issue.history.push({
        id: uuidv4(),
        issue_id: id,
        status: input.status,
        timestamp: now,
        actor,
        note: input.status_note || `Status updated to ${input.status} by ${actor}.`,
      });
    }

    if (input.final_category) issue.final_category = input.final_category;
    if (input.final_department) issue.final_department = input.final_department;
    if (input.final_priority) issue.final_priority = input.final_priority;
    if (input.is_spam !== undefined) issue.is_spam = input.is_spam;

    issue.updated_at = now;
    issues[index] = issue;
    this.writeAll(issues);
    return issue;
  }

  public findNearby(
    lat: number,
    lng: number,
    radiusMeters: number,
    category: Category,
    daysBack: number
  ): Issue[] {
    const issues = this.readAll();
    const cutoff = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000).getTime();

    return issues.filter((issue) => {
      if (issue.status === 'Resolved') return false;
      if (issue.final_category !== category) return false;
      const createdTime = new Date(issue.created_at).getTime();
      if (createdTime < cutoff) return false;

      const dist = haversineDistanceMeters(lat, lng, issue.latitude, issue.longitude);
      return dist <= radiusMeters;
    });
  }

  public incrementReportCount(id: string): void {
    const issues = this.readAll();
    const issue = issues.find((i) => i.id === id);
    if (!issue) return;

    issue.report_count = (issue.report_count || 1) + 1;
    issue.updated_at = new Date().toISOString();

    // Priority escalation at 3+ reports
    if (issue.report_count >= 3) {
      const priorityEscalation: Record<Priority, Priority> = {
        Low: 'Medium',
        Medium: 'High',
        High: 'Critical',
        Critical: 'Critical',
      };
      const oldPriority = issue.final_priority;
      const newPriority = priorityEscalation[oldPriority];
      if (newPriority !== oldPriority) {
        issue.final_priority = newPriority;
        issue.history.push({
          id: uuidv4(),
          issue_id: id,
          status: issue.status,
          timestamp: new Date().toISOString(),
          actor: 'system',
          note: `Priority auto-escalated to ${newPriority} due to ${issue.report_count} community reports.`,
        });
      }
    }

    this.writeAll(issues);
  }

  public linkDuplicate(childId: string, parentId: string): void {
    const issues = this.readAll();
    const child = issues.find((i) => i.id === childId);
    if (!child) return;

    child.duplicate_of = parentId;
    child.updated_at = new Date().toISOString();
    child.history.push({
      id: uuidv4(),
      issue_id: childId,
      status: child.status,
      timestamp: new Date().toISOString(),
      actor: 'system',
      note: `Linked as duplicate of ${parentId}.`,
    });

    this.writeAll(issues);
  }

  public getStats(): DashboardStats {
    const issues = this.readAll();
    const byCategory: Record<string, number> = {};
    const byDepartment: Record<string, number> = {};
    const byStatus: Record<string, number> = {
      Reported: 0,
      'In Progress': 0,
      Resolved: 0,
    };
    const byPriority: Record<string, number> = {
      Critical: 0,
      High: 0,
      Medium: 0,
      Low: 0,
    };

    let totalResolutionHours = 0;
    let resolvedCount = 0;
    let agreeCount = 0;
    let totalEvaluatedAI = 0;

    issues.forEach((i) => {
      byStatus[i.status] = (byStatus[i.status] || 0) + 1;
      byPriority[i.final_priority] = (byPriority[i.final_priority] || 0) + 1;
      byCategory[i.final_category] = (byCategory[i.final_category] || 0) + 1;
      byDepartment[i.final_department] = (byDepartment[i.final_department] || 0) + 1;

      if (i.status === 'Resolved') {
        const resolvedEntry = [...i.history].reverse().find((h) => h.status === 'Resolved');
        const resolveTime = resolvedEntry ? new Date(resolvedEntry.timestamp).getTime() : new Date(i.updated_at).getTime();
        const createTime = new Date(i.created_at).getTime();
        const diffHours = Math.max(0.5, (resolveTime - createTime) / (1000 * 60 * 60));
        totalResolutionHours += diffHours;
        resolvedCount++;
      }

      if (i.ai_analysis) {
        totalEvaluatedAI++;
        const categoryMatch = i.ai_analysis.category === i.final_category;
        const deptMatch = i.ai_analysis.department === i.final_department;
        const priorityMatch = i.ai_analysis.priority === i.final_priority;
        if (categoryMatch && deptMatch && priorityMatch) {
          agreeCount++;
        }
      }
    });

    // Trend by date (last 7 days)
    const trendMap: Record<string, number> = {};
    const now = new Date();
    for (let d = 6; d >= 0; d--) {
      const dateStr = new Date(now.getTime() - d * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      trendMap[dateStr] = 0;
    }
    issues.forEach((i) => {
      const dateStr = i.created_at.split('T')[0];
      if (trendMap[dateStr] !== undefined) {
        trendMap[dateStr]++;
      }
    });

    const trend = Object.entries(trendMap).map(([date, count]) => ({ date, count }));

    return {
      total: issues.length,
      reported: byStatus['Reported'] || 0,
      in_progress: byStatus['In Progress'] || 0,
      resolved: byStatus['Resolved'] || 0,
      critical: byPriority['Critical'] || 0,
      avg_resolution_hours: resolvedCount > 0 ? Math.round((totalResolutionHours / resolvedCount) * 10) / 10 : 0,
      ai_agreement_rate: totalEvaluatedAI > 0 ? Math.round((agreeCount / totalEvaluatedAI) * 100) : 100,
      by_category: byCategory,
      by_department: byDepartment,
      by_status: byStatus,
      by_priority: byPriority,
      trend,
    };
  }

  public getPublicStats(): PublicStats {
    const issues = this.readAll();
    let reported = 0;
    let inProgress = 0;
    let resolved = 0;

    issues.forEach((i) => {
      if (i.status === 'Reported') reported++;
      else if (i.status === 'In Progress') inProgress++;
      else if (i.status === 'Resolved') resolved++;
    });

    return {
      total: issues.length,
      reported,
      in_progress: inProgress,
      resolved,
    };
  }

  public getByDeviceId(deviceId: string): Issue[] {
    const issues = this.readAll();
    return issues.filter((i) => i.device_id === deviceId);
  }

  public reset(): void {
    console.log('[JsonStore] Resetting data to initial seed...');
    const seed = getSeedIssues();
    this.writeAll(seed);
  }
}
