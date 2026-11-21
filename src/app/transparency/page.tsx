import React from 'react';
import Link from 'next/link';
import {
  BarChart3,
  CheckCircle2,
  Clock,
  Building2,
  ShieldCheck,
  MapPin,
  Sparkles,
} from 'lucide-react';
import { getRepository } from '@/lib/db';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { AdminCharts } from '@/components/admin/AdminCharts';

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
    <div className="py-10 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full space-y-10 animate-fade-in-up">
      {/* Title & Municipal Charter Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ff6b5b]/10 text-[#14213d] dark:text-[#f4ede0] border border-[#ff6b5b]/20 text-[11px] font-semibold tracking-wide uppercase mb-3">
          <ShieldCheck className="w-3.5 h-3.5 text-[#ff6b5b]" />
          <span>Public Grievance Redressal Audit</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-light text-[#14213d] dark:text-[#f4ede0] tracking-tight">
          Coimbatore Municipal <span className="font-normal italic text-[#ff6b5b]">SLA & Transparency</span>
        </h1>
        <p className="text-sm sm:text-base text-[#14213d]/70 dark:text-[#f4ede0]/70 mt-2 max-w-2xl leading-relaxed">
          Open citizen metrics tracking departmental turnaround, SLA compliance, and closed civic grievances in real-time.
        </p>
      </div>

      {/* 4 Big Transparency KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Overall Resolution Rate */}
        <div className="p-6 rounded-[28px] bg-[#fcf9f4] dark:bg-white/[0.04] border border-[#14213d]/10 dark:border-white/10 shadow-sm flex flex-col justify-between card-hover-lift">
          <span className="text-xs font-bold text-[#14213d]/60 dark:text-[#f4ede0]/60 uppercase tracking-wider">
            Resolution Rate
          </span>
          <div className="my-3">
            <span className="text-4xl sm:text-5xl font-light text-[#166534] dark:text-emerald-400 font-mono">
              {resolutionRate}%
            </span>
          </div>
          <span className="text-xs text-[#14213d]/60 dark:text-[#f4ede0]/60">
            {stats.resolved} of {stats.total} total complaints resolved
          </span>
        </div>

        {/* Average SLA Turnaround */}
        <div className="p-6 rounded-[28px] bg-[#fcf9f4] dark:bg-white/[0.04] border border-[#14213d]/10 dark:border-white/10 shadow-sm flex flex-col justify-between card-hover-lift">
          <span className="text-xs font-bold text-[#14213d]/60 dark:text-[#f4ede0]/60 uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#ff6b5b]" />
            Average SLA Turnaround
          </span>
          <div className="my-3">
            <span className="text-4xl sm:text-5xl font-light text-[#14213d] dark:text-[#f4ede0] font-mono">
              {stats.avg_resolution_hours}h
            </span>
          </div>
          <span className="text-xs text-[#14213d]/60 dark:text-[#f4ede0]/60">
            Mean time from filing to field crew signoff
          </span>
        </div>

        {/* Active Under Action */}
        <div className="p-6 rounded-[28px] bg-[#fcf9f4] dark:bg-white/[0.04] border border-[#14213d]/10 dark:border-white/10 shadow-sm flex flex-col justify-between card-hover-lift">
          <span className="text-xs font-bold text-[#14213d]/60 dark:text-[#f4ede0]/60 uppercase tracking-wider">
            Active in Progress
          </span>
          <div className="my-3">
            <span className="text-4xl sm:text-5xl font-light text-[#ff6b5b] font-mono">
              {stats.in_progress}
            </span>
          </div>
          <span className="text-xs text-[#14213d]/60 dark:text-[#f4ede0]/60">
            Work orders actively mobilized on ground
          </span>
        </div>

        {/* AI Agreement Integrity */}
        <div className="p-6 rounded-[28px] bg-[#fcf9f4] dark:bg-white/[0.04] border border-[#14213d]/10 dark:border-white/10 shadow-sm flex flex-col justify-between card-hover-lift">
          <span className="text-xs font-bold text-[#14213d]/60 dark:text-[#f4ede0]/60 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#3b82f6]" />
            AI Triage Accuracy
          </span>
          <div className="my-3">
            <span className="text-4xl sm:text-5xl font-light text-[#3b82f6] font-mono">
              {stats.ai_agreement_rate}%
            </span>
          </div>
          <span className="text-xs text-[#14213d]/60 dark:text-[#f4ede0]/60">
            Concurrence between AI and municipal officers
          </span>
        </div>
      </div>

      {/* Visual Municipal Analytics: Recharts styled in navy, coral, sand, slate-blue, sage */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl sm:text-2xl font-light text-[#14213d] dark:text-[#f4ede0] flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#ff6b5b]" />
            <span>Municipal Service Visual Analytics</span>
          </h2>
          <span className="text-xs text-[#14213d]/60 dark:text-[#f4ede0]/60 font-mono">Live Sync</span>
        </div>
        <AdminCharts stats={stats} />
      </div>

      {/* Department Breakdown Table */}
      <div className="p-6 sm:p-8 rounded-[32px] bg-[#fcf9f4] dark:bg-white/[0.04] border border-[#14213d]/10 dark:border-white/10 shadow-sm">
        <h2 className="text-xl font-light text-[#14213d] dark:text-[#f4ede0] mb-5 flex items-center gap-2.5">
          <Building2 className="w-5 h-5 text-[#ff6b5b]" />
          <span>Departmental Complaint Volume & Responsibility</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {Object.entries(stats.by_department).map(([dept, count]) => (
            <div
              key={dept}
              className="p-4 rounded-[20px] bg-white/80 dark:bg-white/[0.03] border border-[#14213d]/10 dark:border-white/10"
            >
              <span className="font-semibold text-xs text-[#14213d] dark:text-[#f4ede0] block line-clamp-1 mb-1.5">
                {dept}
              </span>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#14213d]/60 dark:text-[#f4ede0]/60">Assigned:</span>
                <span className="font-bold font-mono text-[#ff6b5b]">
                  {count}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recently Resolved Grievances Feed */}
      <div className="p-6 sm:p-8 rounded-[32px] bg-[#fcf9f4] dark:bg-white/[0.04] border border-[#14213d]/10 dark:border-white/10 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-light text-[#14213d] dark:text-[#f4ede0] flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-[#166534]" />
            <span>Recently Resolved Grievances</span>
          </h2>
          <span className="text-xs text-[#14213d]/60 dark:text-[#f4ede0]/60">Verified by Municipal Supervisors</span>
        </div>

        {resolvedIssues.length === 0 ? (
          <p className="text-xs text-[#14213d]/60 dark:text-[#f4ede0]/60 italic py-4">No resolved complaints recorded yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {resolvedIssues.map((issue) => (
              <div
                key={issue.id}
                className="p-5 rounded-[22px] border border-[#14213d]/10 dark:border-white/10 bg-white/80 dark:bg-white/[0.03] flex flex-col justify-between hover:border-[#ff6b5b]/40 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-mono text-xs font-bold text-[#14213d]/70 dark:text-[#f4ede0]/70">
                      {issue.tracking_code}
                    </span>
                    <StatusBadge status={issue.status} />
                  </div>
                  <h4 className="font-semibold text-sm text-[#14213d] dark:text-[#f4ede0] line-clamp-1 mb-1">
                    {issue.title}
                  </h4>
                  <p className="text-xs text-[#14213d]/70 dark:text-[#f4ede0]/70 line-clamp-2 mb-3">
                    {issue.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#14213d]/10 dark:border-white/10 flex items-center justify-between text-xs text-[#14213d]/60 dark:text-[#f4ede0]/60">
                  <span className="flex items-center gap-1.5 truncate max-w-[200px]">
                    <MapPin className="w-3.5 h-3.5 text-[#ff6b5b] shrink-0" />
                    <span className="truncate">{issue.address}</span>
                  </span>
                  <Link
                    href={`/track/${issue.tracking_code}`}
                    className="font-bold text-[#14213d] dark:text-[#f4ede0] hover:text-[#ff6b5b] dark:hover:text-[#ff6b5b] transition-colors shrink-0"
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
