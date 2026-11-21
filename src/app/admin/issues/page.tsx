import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import {
  ListFilter,
  Search,
  Users,
  MapPin,
  ArrowRight,
  SlidersHorizontal,
} from 'lucide-react';
import { getRepository } from '@/lib/db';
import { isAdminAuthenticated } from '@/lib/auth/admin';
import { PriorityBadge } from '@/components/ui/PriorityBadge';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { CATEGORIES, DEPARTMENTS, PRIORITIES, STATUSES } from '@/lib/domain/types';

export const dynamic = 'force-dynamic';

export default async function AdminIssuesQueuePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const isAuth = await isAdminAuthenticated();
  if (!isAuth) {
    redirect('/admin/login');
  }

  const resolvedParams = await searchParams;
  const status = resolvedParams.status;
  const priority = resolvedParams.priority;
  const department = resolvedParams.department;
  const category = resolvedParams.category;
  const search = resolvedParams.search;
  const sortBy = (resolvedParams.sort_by as 'urgency_score' | 'created_at' | 'updated_at') || 'urgency_score';

  const repo = getRepository();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { issues, total } = repo.list({
    status: status as any,
    priority: priority as any,
    department: department as any,
    category: category as any,
    search,
    sort_by: sortBy,
    sort_order: 'desc',
    limit: 100,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Priority Complaint Queue
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Ranked by AI urgency score and community report velocity ({total} complaints)
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <form
        method="GET"
        action="/admin/issues"
        className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
      >
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              name="search"
              defaultValue={search || ''}
              placeholder="Search by title, description, address, or tracking code..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs shrink-0"
          >
            Apply Filters
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          {/* Status */}
          <select
            name="status"
            defaultValue={status || ''}
            className="p-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
          >
            <option value="">All Statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          {/* Priority */}
          <select
            name="priority"
            defaultValue={priority || ''}
            className="p-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
          >
            <option value="">All Priorities</option>
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>

          {/* Department */}
          <select
            name="department"
            defaultValue={department || ''}
            className="p-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white truncate"
          >
            <option value="">All Departments</option>
            {DEPARTMENTS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>

          {/* Sort By */}
          <select
            name="sort_by"
            defaultValue={sortBy}
            className="p-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
          >
            <option value="urgency_score">Sort: Urgency Score (High→Low)</option>
            <option value="created_at">Sort: Date Reported (Newest)</option>
            <option value="updated_at">Sort: Recently Updated</option>
          </select>
        </div>
      </form>

      {/* Issues Queue Table */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {issues.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <SlidersHorizontal className="w-8 h-8 mx-auto mb-2 opacity-60" />
            <p className="text-sm font-semibold">No complaints matching the active filter criteria.</p>
            <Link href="/admin/issues" className="text-xs text-emerald-700 font-bold hover:underline mt-2 inline-block">
              Clear All Filters
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase tracking-wider font-bold text-[11px]">
                  <th className="py-3.5 px-4">Tracking Code</th>
                  <th className="py-3.5 px-4">Grievance & Location</th>
                  <th className="py-3.5 px-4">Department</th>
                  <th className="py-3.5 px-4">Priority & Urgency</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                {issues.map((issue) => (
                  <tr
                    key={issue.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    {/* Code */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                        {issue.tracking_code}
                      </span>
                      {issue.report_count > 1 && (
                        <span className="flex items-center gap-0.5 text-[10px] text-amber-600 font-bold mt-0.5">
                          <Users className="w-3 h-3" />
                          {issue.report_count} reports
                        </span>
                      )}
                    </td>

                    {/* Title & Address */}
                    <td className="py-3.5 px-4 max-w-xs">
                      <span className="font-bold text-slate-900 dark:text-white line-clamp-1 block">
                        {issue.title}
                      </span>
                      <span className="text-[11px] text-slate-500 line-clamp-1 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
                        {issue.address}
                      </span>
                    </td>

                    {/* Department */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {issue.final_department}
                      </span>
                      <span className="text-[10px] text-slate-400 block">{issue.final_category}</span>
                    </td>

                    {/* Priority & Urgency Score */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <PriorityBadge
                          priority={issue.final_priority}
                          urgencyScore={issue.ai_analysis?.urgency_score}
                          showScore
                        />
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <StatusBadge status={issue.status} />
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <Link
                        href={`/admin/issues/${issue.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 transition-colors"
                      >
                        <span>Manage</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
