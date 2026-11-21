import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import {
  ShieldAlert,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Sparkles,
  TrendingUp,
  MapPin,
  ArrowRight,
  ListFilter,
} from 'lucide-react';
import { getRepository } from '@/lib/db';
import { isAdminAuthenticated } from '@/lib/auth/admin';
import { PriorityBadge } from '@/components/ui/PriorityBadge';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { AdminCharts } from '@/components/admin/AdminCharts';
import { AiBriefingModal } from '@/components/admin/AiBriefingModal';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const isAuth = await isAdminAuthenticated();
  if (!isAuth) {
    redirect('/admin/login');
  }

  const repo = getRepository();
  const stats = repo.getStats();
  const criticalIssues = repo
    .list({ limit: 100 })
    .issues.filter((i) => i.status !== 'Resolved' && i.final_priority === 'Critical')
    .slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Top Header & AI Briefing Trigger */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Municipal Command & Triage Center
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Coimbatore Corporation • Real-time overview of citizen complaints and departmental workflows
          </p>
        </div>

        <AiBriefingModal />
      </div>

      {/* 6 Key Performance Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Total Filed */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
            Total Filed
          </span>
          <div className="mt-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {stats.total}
            </span>
            <span className="block text-[10px] text-slate-400 mt-0.5">Complaints</span>
          </div>
        </div>

        {/* Active Backlog */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
            Active Backlog
          </span>
          <div className="mt-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-blue-600 dark:text-blue-400">
              {stats.reported + stats.in_progress}
            </span>
            <span className="block text-[10px] text-slate-400 mt-0.5">Under action</span>
          </div>
        </div>

        {/* Critical Emergencies */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-red-200 dark:border-red-900/60 bg-red-50/20 shadow-sm flex flex-col justify-between">
          <span className="text-[11px] font-bold text-red-700 dark:text-red-400 uppercase tracking-wide flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
            Critical Items
          </span>
          <div className="mt-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-red-600 dark:text-red-400">
              {stats.critical}
            </span>
            <span className="block text-[10px] text-red-700 dark:text-red-400 mt-0.5">
              Immediate life/safety
            </span>
          </div>
        </div>

        {/* Resolved */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
            Resolved
          </span>
          <div className="mt-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
              {stats.resolved}
            </span>
            <span className="block text-[10px] text-emerald-700 dark:text-emerald-400 mt-0.5">
              Closed grievances
            </span>
          </div>
        </div>

        {/* Avg Resolution Hours */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1">
            <Clock className="w-3 h-3 text-slate-500" />
            Avg SLA
          </span>
          <div className="mt-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {stats.avg_resolution_hours}h
            </span>
            <span className="block text-[10px] text-slate-400 mt-0.5">Mean turnaround</span>
          </div>
        </div>

        {/* AI Agreement Rate */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-emerald-600" />
            AI Agreement
          </span>
          <div className="mt-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-teal-600 dark:text-teal-400">
              {stats.ai_agreement_rate}%
            </span>
            <span className="block text-[10px] text-slate-400 mt-0.5">Without human override</span>
          </div>
        </div>
      </div>

      {/* Recharts Analytics Section */}
      <AdminCharts stats={stats} />

      {/* Critical Life/Safety Queue Priority Strip */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
              Urgent Critical Escalations Requiring Immediate Action
            </h3>
          </div>
          <Link
            href="/admin/issues?priority=Critical"
            className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1"
          >
            <span>View All Critical Queue</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {criticalIssues.length === 0 ? (
          <p className="text-xs text-slate-500 italic py-4">No open critical complaints logged.</p>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {criticalIssues.map((issue) => (
              <div
                key={issue.id}
                className="py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 px-2 rounded-lg transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-bold text-slate-500">
                      {issue.tracking_code}
                    </span>
                    <PriorityBadge priority={issue.final_priority} />
                    <StatusBadge status={issue.status} />
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                    {issue.title}
                  </h4>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
                    <span className="truncate max-w-lg">{issue.address}</span>
                  </p>
                </div>

                <Link
                  href={`/admin/issues/${issue.id}`}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 shrink-0"
                >
                  Manage Issue →
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
