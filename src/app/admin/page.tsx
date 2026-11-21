import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import {
  Clock,
  AlertTriangle,
  Sparkles,
  MapPin,
  ArrowRight,
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ff6b5b]/10 text-[#14213d] dark:text-[#f4ede0] border border-[#ff6b5b]/20 text-[11px] font-semibold tracking-wide uppercase mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ff6b5b]" />
            Municipal Command & Control
          </div>
          <h1 className="text-2xl sm:text-3xl font-light text-[#14213d] dark:text-[#f4ede0] tracking-tight">
            Municipal Command & <span className="font-normal italic text-[#ff6b5b]">Triage Center</span>
          </h1>
          <p className="text-xs text-[#14213d]/60 dark:text-[#f4ede0]/60 mt-1">
            Coimbatore Corporation • Real-time overview of citizen complaints and departmental workflows
          </p>
        </div>

        <AiBriefingModal />
      </div>

      {/* 6 Key Performance Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Total Filed */}
        <div className="p-4 rounded-[22px] bg-white dark:bg-[#14213d] border border-[#14213d]/15 dark:border-white/15 shadow-sm flex flex-col justify-between card-hover-lift">
          <span className="text-[11px] font-bold text-[#14213d]/60 dark:text-[#f4ede0]/60 uppercase tracking-wider">
            Total Filed
          </span>
          <div className="mt-2">
            <span className="text-2xl sm:text-3xl font-light text-[#14213d] dark:text-[#f4ede0] font-mono">
              {stats.total}
            </span>
            <span className="block text-[10px] text-[#14213d]/50 dark:text-[#f4ede0]/50 mt-0.5">Complaints</span>
          </div>
        </div>

        {/* Active Backlog */}
        <div className="p-4 rounded-[22px] bg-white dark:bg-[#14213d] border border-[#14213d]/15 dark:border-white/15 shadow-sm flex flex-col justify-between card-hover-lift">
          <span className="text-[11px] font-bold text-[#14213d]/60 dark:text-[#f4ede0]/60 uppercase tracking-wider">
            Active Backlog
          </span>
          <div className="mt-2">
            <span className="text-2xl sm:text-3xl font-light text-[#3b82f6] font-mono">
              {stats.reported + stats.in_progress}
            </span>
            <span className="block text-[10px] text-[#14213d]/50 dark:text-[#f4ede0]/50 mt-0.5">Under action</span>
          </div>
        </div>

        {/* Critical Emergencies */}
        <div className="p-4 rounded-[22px] bg-white dark:bg-[#14213d] border border-[#991b1b]/30 bg-[#991b1b]/5 shadow-sm flex flex-col justify-between card-hover-lift">
          <span className="text-[11px] font-bold text-[#991b1b] dark:text-[#fca5a5] uppercase tracking-wider flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5 text-[#991b1b]" />
            Critical Items
          </span>
          <div className="mt-2">
            <span className="text-2xl sm:text-3xl font-light text-[#991b1b] dark:text-[#fca5a5] font-mono">
              {stats.critical}
            </span>
            <span className="block text-[10px] text-[#991b1b] dark:text-[#fca5a5] mt-0.5">
              Immediate safety
            </span>
          </div>
        </div>

        {/* Resolved */}
        <div className="p-4 rounded-[22px] bg-white dark:bg-[#14213d] border border-[#14213d]/15 dark:border-white/15 shadow-sm flex flex-col justify-between card-hover-lift">
          <span className="text-[11px] font-bold text-[#14213d]/60 dark:text-[#f4ede0]/60 uppercase tracking-wider">
            Resolved
          </span>
          <div className="mt-2">
            <span className="text-2xl sm:text-3xl font-light text-[#166534] dark:text-emerald-400 font-mono">
              {stats.resolved}
            </span>
            <span className="block text-[10px] text-[#166534] dark:text-emerald-400 mt-0.5">
              Closed grievances
            </span>
          </div>
        </div>

        {/* Avg Resolution Hours */}
        <div className="p-4 rounded-[22px] bg-white dark:bg-[#14213d] border border-[#14213d]/15 dark:border-white/15 shadow-sm flex flex-col justify-between card-hover-lift">
          <span className="text-[11px] font-bold text-[#14213d]/60 dark:text-[#f4ede0]/60 uppercase tracking-wider flex items-center gap-1">
            <Clock className="w-3 h-3 text-[#ff6b5b]" />
            Avg SLA
          </span>
          <div className="mt-2">
            <span className="text-2xl sm:text-3xl font-light text-[#14213d] dark:text-[#f4ede0] font-mono">
              {stats.avg_resolution_hours}h
            </span>
            <span className="block text-[10px] text-[#14213d]/50 dark:text-[#f4ede0]/50 mt-0.5">Mean turnaround</span>
          </div>
        </div>

        {/* AI Agreement Rate */}
        <div className="p-4 rounded-[22px] bg-white dark:bg-[#14213d] border border-[#14213d]/15 dark:border-white/15 shadow-sm flex flex-col justify-between card-hover-lift">
          <span className="text-[11px] font-bold text-[#14213d]/60 dark:text-[#f4ede0]/60 uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#ff6b5b]" />
            AI Agreement
          </span>
          <div className="mt-2">
            <span className="text-2xl sm:text-3xl font-light text-[#ff6b5b] font-mono">
              {stats.ai_agreement_rate}%
            </span>
            <span className="block text-[10px] text-[#14213d]/50 dark:text-[#f4ede0]/50 mt-0.5">Without override</span>
          </div>
        </div>
      </div>

      {/* Recharts Analytics Section */}
      <AdminCharts stats={stats} />

      {/* Critical Life/Safety Queue Priority Strip */}
      <div className="p-6 sm:p-8 rounded-[28px] bg-white dark:bg-[#14213d] border border-[#14213d]/15 dark:border-white/15 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-[#991b1b]" />
            <h3 className="font-bold text-base text-[#14213d] dark:text-[#f4ede0]">
              Urgent Critical Escalations Requiring Immediate Action
            </h3>
          </div>
          <Link
            href="/admin/issues?priority=Critical"
            className="text-xs font-bold text-[#14213d] dark:text-[#f4ede0] hover:text-[#ff6b5b] dark:hover:text-[#ff6b5b] flex items-center gap-1 transition-colors"
          >
            <span>View All Critical Queue</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {criticalIssues.length === 0 ? (
          <p className="text-xs text-[#14213d]/50 dark:text-[#f4ede0]/50 italic py-4">No open critical complaints logged.</p>
        ) : (
          <div className="divide-y divide-[#14213d]/10 dark:divide-white/10">
            {criticalIssues.map((issue) => (
              <div
                key={issue.id}
                className="py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-[#ff6b5b]/5 px-3 rounded-[16px] transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-bold text-[#14213d]/60 dark:text-[#f4ede0]/60">
                      {issue.tracking_code}
                    </span>
                    <PriorityBadge priority={issue.final_priority} />
                    <StatusBadge status={issue.status} />
                  </div>
                  <h4 className="font-semibold text-sm text-[#14213d] dark:text-[#f4ede0]">
                    {issue.title}
                  </h4>
                  <p className="text-xs text-[#14213d]/60 dark:text-[#f4ede0]/60 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-[#ff6b5b] shrink-0" />
                    <span className="truncate max-w-lg">{issue.address}</span>
                  </p>
                </div>

                <Link
                  href={`/admin/issues/${issue.id}`}
                  className="px-4 py-2 rounded-full text-xs font-bold text-white bg-[#14213d] hover:bg-[#ff6b5b] hover:text-[#14213d] dark:bg-white/10 dark:hover:bg-[#ff6b5b] dark:hover:text-[#14213d] transition-all shrink-0"
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
