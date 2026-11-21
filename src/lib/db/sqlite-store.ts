import fs from 'fs';
import path from 'path';
import Database from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';
import type {
  Issue,
  CreateIssueInput,
  UpdateIssueInput,
  IssueFilters,
  DashboardStats,
  PublicStats,
  Category,
  Department,
  StatusEntry,
  Priority,
  Status,
  TriageResult,
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

interface IssueRow {
  id: string;
  tracking_code: string;
  title: string;
  description: string;
  original_language: string;
  latitude: number;
  longitude: number;
  address: string;
  category: string;
  image_url: string | null;
  ai_analysis: string | null;
  final_category: string;
  final_department: string;
  final_priority: string;
  status: string;
  history: string;
  duplicate_of: string | null;
  report_count: number;
  device_id: string | null;
  contact: string | null;
  is_spam: number;
  created_at: string;
  updated_at: string;
}

export class SqliteRepository implements IssueRepository {
  private db: Database.Database;
  private dbPath: string;

  constructor(customPath?: string) {
    const isVercel = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
    const defaultDataDir = isVercel ? path.join('/tmp', 'data') : path.join(process.cwd(), 'data');
    if (!fs.existsSync(defaultDataDir)) {
      fs.mkdirSync(defaultDataDir, { recursive: true });
    }
    this.dbPath = customPath || process.env.DATABASE_PATH || path.join(defaultDataDir, 'civicresolve.db');
    const dir = path.dirname(this.dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Dynamic require so module load doesn't crash if native binary is unavailable
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const DatabaseConstructor = require('better-sqlite3');
    this.db = new DatabaseConstructor(this.dbPath);
    // Enable WAL mode for concurrent read/write performance
    this.db.pragma('journal_mode = WAL');
    this.db.pragma('synchronous = NORMAL');
    this.createTables();
  }

  private createTables(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS issues (
        id TEXT PRIMARY KEY,
        tracking_code TEXT UNIQUE NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        original_language TEXT NOT NULL,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        address TEXT NOT NULL,
        category TEXT NOT NULL,
        image_url TEXT,
        ai_analysis TEXT,
        final_category TEXT NOT NULL,
        final_department TEXT NOT NULL,
        final_priority TEXT NOT NULL,
        status TEXT NOT NULL,
        history TEXT NOT NULL,
        duplicate_of TEXT,
        report_count INTEGER NOT NULL DEFAULT 1,
        device_id TEXT,
        contact TEXT,
        is_spam INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_issues_tracking_code ON issues(tracking_code);
      CREATE INDEX IF NOT EXISTS idx_issues_status ON issues(status);
      CREATE INDEX IF NOT EXISTS idx_issues_priority ON issues(final_priority);
      CREATE INDEX IF NOT EXISTS idx_issues_department ON issues(final_department);
      CREATE INDEX IF NOT EXISTS idx_issues_category ON issues(final_category);
      CREATE INDEX IF NOT EXISTS idx_issues_device ON issues(device_id);
      CREATE INDEX IF NOT EXISTS idx_issues_created ON issues(created_at);
    `);
  }

  private rowToIssue(row: IssueRow): Issue {
    return {
      id: row.id,
      tracking_code: row.tracking_code,
      title: row.title,
      description: row.description,
      original_language: row.original_language,
      latitude: row.latitude,
      longitude: row.longitude,
      address: row.address,
      category: row.category as Category,
      image_url: row.image_url,
      ai_analysis: row.ai_analysis ? (JSON.parse(row.ai_analysis) as TriageResult) : null,
      final_category: row.final_category as Category,
      final_department: row.final_department as Department,
      final_priority: row.final_priority as Priority,
      status: row.status as Status,
      history: row.history ? JSON.parse(row.history) : [],
      duplicate_of: row.duplicate_of,
      report_count: row.report_count,
      device_id: row.device_id,
      contact: row.contact,
      is_spam: Boolean(row.is_spam),
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }

  public initialize(): void {
    const count = this.getCount();
    if (count === 0) {
      console.log(`[SQLiteStore] Empty database at ${this.dbPath}. Seeding initial 25 complaints...`);
      const seed = getSeedIssues();
      const insert = this.db.prepare(`
        INSERT INTO issues (
          id, tracking_code, title, description, original_language,
          latitude, longitude, address, category, image_url,
          ai_analysis, final_category, final_department, final_priority,
          status, history, duplicate_of, report_count, device_id,
          contact, is_spam, created_at, updated_at
        ) VALUES (
          @id, @tracking_code, @title, @description, @original_language,
          @latitude, @longitude, @address, @category, @image_url,
          @ai_analysis, @final_category, @final_department, @final_priority,
          @status, @history, @duplicate_of, @report_count, @device_id,
          @contact, @is_spam, @created_at, @updated_at
        )
      `);

      const insertMany = this.db.transaction((issues: Issue[]) => {
        for (const i of issues) {
          insert.run({
            id: i.id,
            tracking_code: i.tracking_code,
            title: i.title,
            description: i.description,
            original_language: i.original_language || 'en',
            latitude: i.latitude,
            longitude: i.longitude,
            address: i.address,
            category: i.category,
            image_url: i.image_url || null,
            ai_analysis: i.ai_analysis ? JSON.stringify(i.ai_analysis) : null,
            final_category: i.final_category,
            final_department: i.final_department,
            final_priority: i.final_priority,
            status: i.status,
            history: JSON.stringify(i.history || []),
            duplicate_of: i.duplicate_of || null,
            report_count: i.report_count || 1,
            device_id: i.device_id || null,
            contact: i.contact || null,
            is_spam: i.is_spam ? 1 : 0,
            created_at: i.created_at,
            updated_at: i.updated_at,
          });
        }
      });

      insertMany(seed);
      console.log(`[SQLiteStore] Successfully seeded ${seed.length} complaints.`);
    }
  }

  public getCount(): number {
    const row = this.db.prepare('SELECT COUNT(*) as count FROM issues').get() as { count: number };
    return row.count;
  }

  public create(input: CreateIssueInput): Issue {
    const now = new Date().toISOString();
    const id = uuidv4();
    const currentCount = this.getCount();
    const trackingCode = generateTrackingCode(currentCount);

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
      image_url: input.image_url || null,
      ai_analysis: input.ai_analysis || null,
      final_category: input.final_category,
      final_department: input.final_department,
      final_priority: input.final_priority,
      status: 'Reported',
      history: [initialHistory],
      duplicate_of: null,
      report_count: 1,
      device_id: input.device_id || null,
      contact: input.contact || null,
      is_spam: false,
      created_at: now,
      updated_at: now,
    };

    const stmt = this.db.prepare(`
      INSERT INTO issues (
        id, tracking_code, title, description, original_language,
        latitude, longitude, address, category, image_url,
        ai_analysis, final_category, final_department, final_priority,
        status, history, duplicate_of, report_count, device_id,
        contact, is_spam, created_at, updated_at
      ) VALUES (
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?
      )
    `);

    stmt.run(
      newIssue.id,
      newIssue.tracking_code,
      newIssue.title,
      newIssue.description,
      newIssue.original_language,
      newIssue.latitude,
      newIssue.longitude,
      newIssue.address,
      newIssue.category,
      newIssue.image_url,
      newIssue.ai_analysis ? JSON.stringify(newIssue.ai_analysis) : null,
      newIssue.final_category,
      newIssue.final_department,
      newIssue.final_priority,
      newIssue.status,
      JSON.stringify(newIssue.history),
      newIssue.duplicate_of,
      newIssue.report_count,
      newIssue.device_id,
      newIssue.contact,
      newIssue.is_spam ? 1 : 0,
      newIssue.created_at,
      newIssue.updated_at
    );

    return newIssue;
  }

  public getById(id: string): Issue | null {
    const row = this.db.prepare('SELECT * FROM issues WHERE id = ?').get(id) as IssueRow | undefined;
    return row ? this.rowToIssue(row) : null;
  }

  public getByTrackingCode(code: string): Issue | null {
    const formatted = code.trim().toUpperCase();
    const row = this.db.prepare('SELECT * FROM issues WHERE UPPER(tracking_code) = ?').get(formatted) as IssueRow | undefined;
    return row ? this.rowToIssue(row) : null;
  }

  public list(filters: IssueFilters): { issues: Issue[]; total: number } {
    const whereClauses: string[] = [];
    const params: (string | number)[] = [];

    if (filters.status) {
      whereClauses.push('status = ?');
      params.push(filters.status);
    }
    if (filters.priority) {
      whereClauses.push('final_priority = ?');
      params.push(filters.priority);
    }
    if (filters.department) {
      whereClauses.push('final_department = ?');
      params.push(filters.department);
    }
    if (filters.category) {
      whereClauses.push('final_category = ?');
      params.push(filters.category);
    }
    if (filters.device_id) {
      whereClauses.push('device_id = ?');
      params.push(filters.device_id);
    }
    if (filters.search) {
      whereClauses.push('(LOWER(title) LIKE ? OR LOWER(description) LIKE ? OR LOWER(address) LIKE ? OR LOWER(tracking_code) LIKE ?)');
      const q = `%${filters.search.toLowerCase().trim()}%`;
      params.push(q, q, q, q);
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const countRow = this.db.prepare(`SELECT COUNT(*) as count FROM issues ${whereSql}`).get(...params) as { count: number };
    const total = countRow.count;

    const rows = this.db.prepare(`SELECT * FROM issues ${whereSql}`).all(...params) as IssueRow[];
    const issues = rows.map((r) => this.rowToIssue(r));

    const sortBy = filters.sort_by || 'urgency_score';
    const sortOrder = filters.sort_order || 'desc';

    issues.sort((a, b) => {
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

    const offset = filters.offset || 0;
    const limit = filters.limit || 50;
    const paginated = issues.slice(offset, offset + limit);

    return { issues: paginated, total };
  }

  public update(id: string, input: UpdateIssueInput, actor: string): Issue | null {
    const current = this.getById(id);
    if (!current) return null;

    const now = new Date().toISOString();
    const history = [...current.history];

    let newStatus = current.status;
    if (input.status && input.status !== current.status) {
      newStatus = input.status;
      history.push({
        id: uuidv4(),
        issue_id: id,
        status: input.status,
        timestamp: now,
        actor,
        note: input.status_note || `Status updated to ${input.status} by ${actor}.`,
      });
    }

    const finalCategory = input.final_category || current.final_category;
    const finalDepartment = input.final_department || current.final_department;
    const finalPriority = input.final_priority || current.final_priority;
    const isSpam = input.is_spam !== undefined ? (input.is_spam ? 1 : 0) : (current.is_spam ? 1 : 0);

    const stmt = this.db.prepare(`
      UPDATE issues SET
        status = ?,
        final_category = ?,
        final_department = ?,
        final_priority = ?,
        is_spam = ?,
        history = ?,
        updated_at = ?
      WHERE id = ?
    `);

    stmt.run(
      newStatus,
      finalCategory,
      finalDepartment,
      finalPriority,
      isSpam,
      JSON.stringify(history),
      now,
      id
    );

    return this.getById(id);
  }

  public findNearby(
    lat: number,
    lng: number,
    radiusMeters: number,
    category: Category,
    daysBack: number
  ): Issue[] {
    const cutoff = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000).toISOString();
    const rows = this.db.prepare(`
      SELECT * FROM issues
      WHERE status != 'Resolved'
        AND final_category = ?
        AND created_at >= ?
    `).all(category, cutoff) as IssueRow[];

    const candidates = rows.map((r) => this.rowToIssue(r));

    return candidates.filter((issue) => {
      const dist = haversineDistanceMeters(lat, lng, issue.latitude, issue.longitude);
      return dist <= radiusMeters;
    });
  }

  public incrementReportCount(id: string): void {
    const current = this.getById(id);
    if (!current) return;

    const newCount = (current.report_count || 1) + 1;
    let newPriority = current.final_priority;
    const history = [...current.history];
    const now = new Date().toISOString();

    if (newCount >= 3) {
      const priorityEscalation: Record<Priority, Priority> = {
        Low: 'Medium',
        Medium: 'High',
        High: 'Critical',
        Critical: 'Critical',
      };
      const oldPriority = current.final_priority;
      newPriority = priorityEscalation[oldPriority];
      if (newPriority !== oldPriority) {
        history.push({
          id: uuidv4(),
          issue_id: id,
          status: current.status,
          timestamp: now,
          actor: 'system',
          note: `Priority auto-escalated to ${newPriority} due to ${newCount} community reports.`,
        });
      }
    }

    this.db.prepare(`
      UPDATE issues SET
        report_count = ?,
        final_priority = ?,
        history = ?,
        updated_at = ?
      WHERE id = ?
    `).run(newCount, newPriority, JSON.stringify(history), now, id);
  }

  public linkDuplicate(childId: string, parentId: string): void {
    const current = this.getById(childId);
    if (!current) return;

    const now = new Date().toISOString();
    const history = [...current.history];
    history.push({
      id: uuidv4(),
      issue_id: childId,
      status: current.status,
      timestamp: now,
      actor: 'system',
      note: `Linked as duplicate of ${parentId}.`,
    });

    this.db.prepare(`
      UPDATE issues SET
        duplicate_of = ?,
        history = ?,
        updated_at = ?
      WHERE id = ?
    `).run(parentId, JSON.stringify(history), now, childId);
  }

  public getStats(): DashboardStats {
    const rows = this.db.prepare('SELECT * FROM issues').all() as IssueRow[];
    const issues = rows.map((r) => this.rowToIssue(r));

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
    const total = this.getCount();
    const rows = this.db.prepare('SELECT status, COUNT(*) as count FROM issues GROUP BY status').all() as { status: string; count: number }[];
    const statusMap = new Map<string, number>(rows.map((r) => [r.status, r.count]));

    return {
      total,
      reported: statusMap.get('Reported') || 0,
      in_progress: statusMap.get('In Progress') || 0,
      resolved: statusMap.get('Resolved') || 0,
    };
  }

  public getByDeviceId(deviceId: string): Issue[] {
    const rows = this.db.prepare('SELECT * FROM issues WHERE device_id = ?').all(deviceId) as IssueRow[];
    return rows.map((r) => this.rowToIssue(r));
  }

  public reset(): void {
    console.log('[SQLiteStore] Resetting data to initial seed...');
    this.db.exec('DELETE FROM issues');
    this.initialize();
  }
}
