import React from 'react';
import Link from 'next/link';
import {
  BarChart3,
  CheckCircle2,
  Clock,
  Building2,
  TrendingUp,
  ShieldCheck,
  ArrowRight,
  MapPin,
} from 'lucide-react';
import { getRepository } from '@/lib/db';
import { PriorityBadge } from '@/components/ui/PriorityBadge';
import { StatusBadge } from '@/components/ui/StatusBadge';

export const dynamic = 'force-dynamic';

export default async function TransparencyPage() {
  const repo = getRepository();
  const stats = repo.getStats();
  const resolvedIssues = repo
    .list({ status: 'Resolved', limit: 8, sort_by: 'updated_at', sort_order: 'desc' })
    .issues;

  const resolutionRate =
    stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0;

  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full space-y-10">
      {/* Title & Municipal Charter Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-semibold mb-3">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Public Grievance Redressal Audit</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Coimbatore Municipal Service Delivery SLA & Transparency Dashboard
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 max-w-2xl leading-relaxed">
          Open citizen metrics tracking departmental resolution turnaround, SLA compliance, and closed civic grievances in real-time.
        </p>
      </div>

      {/* 4 Big Transparency Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Overall Resolution Rate */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
            Resolution Rate
          </span>
          <div className="my-2">
            <span className="text-4xl font-black text-emerald-600 dark:text-emerald-400">
              {resolutionRate}%
            </span>
          </div>
          <span className="text-[11px] text-slate-500">
            {stats.resolved} of {stats.total} total complaints resolved
          </span>
        </div>

        {/* Average SLA Turnaround */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-teal-600" />
            Average Resolution
          </span>
          <div className="my-2">
            <span className="text-4xl font-black text-slate-900 dark:text-white">
              {stats.avg_resolution_hours}h
            </span>
          </div>
          <span className="text-[11px] text-slate-500">Mean time from filing to crew signoff</span>
        </div>

        {/* Active Under Action */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
            Active in Progress
          </span>
          <div className="my-2">
            <span className="text-4xl font-black text-amber-500">
              {stats.in_progress}
            </span>
          </div>
          <span className="text-[11px] text-slate-500">Work orders actively mobilized on ground</span>
        </div>

        {/* AI Agreement Integrity */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
            AI Triage Accuracy
          </span>
          <div className="my-2">
            <span className="text-4xl font-black text-teal-600 dark:text-teal-400">
              {stats.ai_agreement_rate}%
            </span>
          </div>
          <span className="text-[11px] text-slate-500">Concurrence between AI and municipal officers</span>
        </div>
      </div>

      {/* Department Breakdown Table */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-emerald-700" />
          <span>Departmental Complaint Volume & Responsibility</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {Object.entries(stats.by_department).map(([dept, count]) => (
            <div
              key={dept}
              className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60"
            >
              <span className="font-bold text-xs text-slate-900 dark:text-white block line-clamp-1 mb-1">
                {dept}
              </span>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Total Assigned:</span>
                <span className="font-bold font-mono text-emerald-800 dark:text-emerald-400">
                  {count}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recently Resolved Grievances Feed */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>Recently Resolved Grievances</span>
          </h2>
          <span className="text-xs text-slate-500">Verified by Municipal Supervisors</span>
        </div>

        {resolvedIssues.length === 0 ? (
          <p className="text-xs text-slate-500 italic py-4">No resolved complaints recorded yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {resolvedIssues.map((issue) => (
              <div
                key={issue.id}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="font-mono text-xs font-bold text-slate-500">
                      {issue.tracking_code}
                    </span>
                    <StatusBadge status={issue.status} />
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1 mb-1">
                    {issue.title}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mb-2">
                    {issue.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-[11px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-emerald-600" />
                    <span className="truncate max-w-[180px]">{issue.address}</span>
                  </span>
                  <Link
                    href={`/track/${issue.tracking_code}`}
                    className="font-semibold text-emerald-700 hover:underline"
                  >
                    View Timeline →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
