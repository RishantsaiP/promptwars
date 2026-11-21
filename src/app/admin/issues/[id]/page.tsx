import React from 'react';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Sparkles,
  Users,
  Building2,
  Clock,
  ShieldCheck,
  Image as ImageIcon,
} from 'lucide-react';
import { getRepository } from '@/lib/db';
import { isAdminAuthenticated } from '@/lib/auth/admin';
import { PriorityBadge } from '@/components/ui/PriorityBadge';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { SinglePinMap } from '@/components/map/SinglePinMap';
import { IssueActionPanel } from '@/components/admin/IssueActionPanel';

export const dynamic = 'force-dynamic';

export default async function AdminIssueDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const isAuth = await isAdminAuthenticated();
  if (!isAuth) {
    redirect('/admin/login');
  }

  const { id } = await params;
  const repo = getRepository();
  const issue = repo.getById(id);

  if (!issue) {
    notFound();
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin/issues"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Priority Queue</span>
        </Link>
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold text-slate-500">{issue.tracking_code}</span>
          <StatusBadge status={issue.status} />
        </div>
      </div>

      {/* Header Card */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
          <div>
            <span className="text-xs font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider block mb-1">
              {issue.final_category} • {issue.final_department}
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
              {issue.title}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <PriorityBadge
              priority={issue.final_priority}
              urgencyScore={issue.ai_analysis?.urgency_score}
              showScore
            />
          </div>
        </div>

        <p className="text-xs text-slate-500 flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>{issue.address}</span>
        </p>

        {issue.report_count > 1 && (
          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs font-semibold">
            <Users className="w-3.5 h-3.5 text-amber-600" />
            <span>{issue.report_count} community members have reported this grievance</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Evidence, Map & History (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Photo & Description */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Citizen Description
            </h3>
            <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed mb-4">
              {issue.description}
            </p>

            {issue.image_url && (
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Photographic Evidence
                </span>
                <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 max-h-80 bg-slate-950 flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={issue.image_url}
                    alt={issue.title}
                    className="w-full h-full object-contain max-h-80"
                  />
                </div>
              </div>
            )}
          </div>

          {/* AI Analysis Card */}
          {issue.ai_analysis && (
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-500/40 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                  </div>
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                    Gemini AI Triage Assessment
                  </h3>
                </div>
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                  {Math.round(issue.ai_analysis.confidence * 100)}% Confidence
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                  <span className="font-bold text-slate-700 dark:text-slate-300 block mb-0.5">
                    Priority Justification:
                  </span>
                  <p className="text-slate-600 dark:text-slate-400">
                    {issue.ai_analysis.priority_reasoning}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                    <span className="font-bold text-slate-700 dark:text-slate-300 block mb-0.5">
                      Target SLA:
                    </span>
                    <span className="text-slate-900 dark:text-white font-semibold">
                      {issue.ai_analysis.suggested_sla_hours} Hours
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                    <span className="font-bold text-slate-700 dark:text-slate-300 block mb-0.5">
                      Photo Verification:
                    </span>
                    <span className="text-slate-900 dark:text-white font-semibold capitalize">
                      {issue.ai_analysis.image_check} ({issue.ai_analysis.image_check_note})
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/50">
                  <span className="font-bold text-emerald-950 dark:text-emerald-200 block mb-0.5">
                    Recommended Crew Dispatch Instruction:
                  </span>
                  <p className="text-emerald-900 dark:text-emerald-300">
                    {issue.ai_analysis.recommended_action}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Incident Location Map */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              Incident Coordinates ({issue.latitude.toFixed(4)}, {issue.longitude.toFixed(4)})
            </h3>
            <SinglePinMap
              latitude={issue.latitude}
              longitude={issue.longitude}
              title={issue.title}
              address={issue.address}
            />
          </div>

          {/* History Timeline */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-emerald-600" />
              Complete Action Audit Trail
            </h3>

            <div className="space-y-4 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
              {issue.history.map((entry) => (
                <div key={entry.id} className="relative pl-8">
                  <div className="absolute left-1.5 top-1.5 w-3.5 h-3.5 rounded-full bg-emerald-600 ring-4 ring-white dark:ring-slate-900 -translate-x-1/2" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {entry.status}
                      </span>
                      <span className="text-[10px] uppercase font-semibold px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        {entry.actor}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(entry.timestamp).toLocaleString('en-IN', {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                      {entry.note}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Supervisor Action Panel (1 col) */}
        <div>
          <div className="sticky top-20">
            <IssueActionPanel issue={issue} />
          </div>
        </div>
      </div>
    </div>
  );
}
