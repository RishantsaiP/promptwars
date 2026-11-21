import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import {
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
import type { Category, Department, Priority, Status } from '@/lib/domain/types';
import { DEPARTMENTS, PRIORITIES, STATUSES } from '@/lib/domain/types';

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
  const { issues, total } = repo.list({
    status: status ? (status as Status) : undefined,
    priority: priority ? (priority as Priority) : undefined,
    department: department ? (department as Department) : undefined,
    category: category ? (category as Category) : undefined,
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
        className="p-5 rounded-[24px] bg-[#fcf9f4] dark:bg-white/[0.04] border border-[#14213d]/10 dark:border-white/10 shadow-sm space-y-3"
      >
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#14213d]/40 dark:text-[#f4ede0]/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              name="search"
              defaultValue={search || ''}
              placeholder="Search by title, description, address, or tracking code..."
              className="w-full min-h-[44px] pl-10 pr-4 text-xs sm:text-sm rounded-full border border-[#14213d]/15 dark:border-white/15 bg-white dark:bg-[#14213d] text-[#14213d] dark:text-[#f4ede0] placeholder:text-[#14213d]/40 dark:placeholder:text-[#f4ede0]/40 outline-none focus:ring-2 focus:ring-[#ff6b5b]"
            />
          </div>
          <button
            type="submit"
            className="btn-coral px-5 py-2.5 rounded-full font-bold text-xs shrink-0 shadow-sm transition-all"
          >
            Apply Filters
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-[#14213d]/10 dark:border-white/10">
          {/* Status */}
          <select
            name="status"
            defaultValue={status || ''}
            className="p-2.5 text-xs rounded-full border border-[#14213d]/15 dark:border-white/15 bg-white dark:bg-[#14213d] text-[#14213d] dark:text-[#f4ede0]"
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
            className="p-2.5 text-xs rounded-full border border-[#14213d]/15 dark:border-white/15 bg-white dark:bg-[#14213d] text-[#14213d] dark:text-[#f4ede0]"
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
            className="p-2.5 text-xs rounded-full border border-[#14213d]/15 dark:border-white/15 bg-white dark:bg-[#14213d] text-[#14213d] dark:text-[#f4ede0] truncate"
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
            className="p-2.5 text-xs rounded-full border border-[#14213d]/15 dark:border-white/15 bg-white dark:bg-[#14213d] text-[#14213d] dark:text-[#f4ede0]"
          >
            <option value="urgency_score">Sort: Urgency Score (High→Low)</option>
            <option value="created_at">Sort: Date Reported (Newest)</option>
            <option value="updated_at">Sort: Recently Updated</option>
          </select>
        </div>
      </form>

      {/* Issues Queue Table with Zebra striping and sticky header */}
      <div className="rounded-[24px] bg-[#fcf9f4] dark:bg-white/[0.04] border border-[#14213d]/10 dark:border-white/10 shadow-sm overflow-hidden">
        {issues.length === 0 ? (
          <div className="py-16 text-center text-[#14213d]/50 dark:text-[#f4ede0]/50">
            <SlidersHorizontal className="w-8 h-8 mx-auto mb-2 opacity-60" />
            <p className="text-sm font-semibold">No complaints matching the active filter criteria.</p>
            <Link href="/admin/issues" className="text-xs text-[#ff6b5b] font-bold hover:underline mt-2 inline-block">
              Clear All Filters
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="sticky top-0 z-10 bg-[#f4ede0] dark:bg-[#14213d] border-b border-[#14213d]/10 dark:border-white/10 text-[#14213d]/70 dark:text-[#f4ede0]/70 uppercase tracking-wider font-bold text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">Tracking Code</th>
                  <th className="py-3.5 px-4">Grievance & Location</th>
                  <th className="py-3.5 px-4">Department</th>
                  <th className="py-3.5 px-4">Priority & Urgency</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#14213d]/5 dark:divide-white/5 text-[#14213d] dark:text-[#f4ede0]">
                {issues.map((issue) => (
                  <tr
                    key={issue.id}
                    className="even:bg-white/60 odd:bg-transparent dark:even:bg-white/[0.12] dark:odd:bg-transparent hover:bg-[#ff6b5b]/5 transition-colors"
                  >
                    {/* Code */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-mono font-bold text-[#14213d] dark:text-[#f4ede0]">
                        {issue.tracking_code}
                      </span>
                      {issue.report_count > 1 && (
                        <span className="flex items-center gap-0.5 text-[10px] text-amber-700 dark:text-amber-400 font-bold mt-0.5">
                          <Users className="w-3 h-3" />
                          {issue.report_count} reports
                        </span>
                      )}
                    </td>

                    {/* Title & Address */}
                    <td className="py-3.5 px-4 max-w-xs">
                      <span className="font-semibold text-xs text-[#14213d] dark:text-[#f4ede0] line-clamp-1 block">
                        {issue.title}
                      </span>
                      <span className="text-[11px] text-[#14213d]/60 dark:text-[#f4ede0]/60 line-clamp-1 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-[#ff6b5b] shrink-0" />
                        {issue.address}
                      </span>
                    </td>

                    {/* Department */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-semibold text-[#14213d] dark:text-[#f4ede0]">
                        {issue.final_department}
                      </span>
                      <span className="text-[10px] text-[#14213d]/50 dark:text-[#f4ede0]/50 block">{issue.final_category}</span>
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
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold text-[#14213d] dark:text-[#f4ede0] bg-[#e6dcce]/60 hover:bg-[#ff6b5b] hover:text-[#14213d] dark:bg-white/10 dark:hover:bg-[#ff6b5b] dark:hover:text-[#14213d] transition-all"
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
