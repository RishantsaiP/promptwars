import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  Send,
  Wrench,
  CheckCircle2,
  Clock,
  MapPin,
  Users,
  Building2,
  Sparkles,
  ArrowLeft,
  Calendar,
  AlertTriangle,
  Layers,
  Search,
} from 'lucide-react';
import { getRepository } from '@/lib/db';
import { PriorityBadge } from '@/components/ui/PriorityBadge';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { SinglePinMap } from '@/components/map/SinglePinMap';

export const dynamic = 'force-dynamic';

export default async function TrackIssuePage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const repo = getRepository();
  const issue = repo.getByTrackingCode(code);

  if (!issue) {
    return (
      <div className="py-16 px-4 max-w-lg mx-auto text-center">
        <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4 text-slate-400">
          <Search className="w-7 h-7" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          Tracking Code Not Found
        </h1>
        <p className="text-xs text-slate-500 mb-6">
          We could not locate any complaint registered under code{' '}
          <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{code}</span>.
        </p>

        <form action="/track" method="GET" className="flex items-center gap-2 max-w-sm mx-auto mb-6">
          <input
            type="text"
            name="code"
            placeholder="Try another code (e.g. CR-2026-0001)"
            className="flex-1 p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs uppercase font-mono outline-none"
            required
          />
          <button
            type="submit"
            className="px-4 py-2.5 rounded-xl bg-emerald-800 text-white font-bold text-xs"
          >
            Search
          </button>
        </form>

        <Link href="/" className="text-xs font-semibold text-emerald-700 hover:underline">
          ← Return to Home
        </Link>
      </div>
    );
  }

  // Calculate delivery stepper active state
  // Steps: 1: Reported, 2: In Progress, 3: Resolved
  const stepIndex =
    issue.status === 'Resolved' ? 3 : issue.status === 'In Progress' ? 2 : 1;

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
      {/* Top Navigation Strip */}
      <div className="flex items-center justify-between mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Home</span>
        </Link>
        <span className="font-mono text-xs font-extrabold px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
          {issue.tracking_code}
        </span>
      </div>

      {/* Main Status Header Card */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm mb-6">
        <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider">
                {issue.final_category}
              </span>
              <span>•</span>
              <span className="text-xs text-slate-500">{issue.final_department}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {issue.title}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <PriorityBadge priority={issue.final_priority} />
            <StatusBadge status={issue.status} />
          </div>
        </div>

        {/* Community Signal Badge */}
        {issue.report_count > 1 && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs font-semibold mb-4">
            <Users className="w-3.5 h-3.5 text-amber-600" />
            <span>{issue.report_count} neighbors reported this incident</span>
          </div>
        )}

        {/* Delivery-Style 3-Step Stepper */}
        <div className="pt-6 pb-2">
          <div className="relative flex items-center justify-between max-w-2xl mx-auto">
            {/* Connecting progress bar */}
            <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-1 bg-slate-200 dark:bg-slate-800 -z-0">
              <div
                className="h-full bg-emerald-600 transition-all duration-500"
                style={{
                  width: stepIndex === 3 ? '100%' : stepIndex === 2 ? '50%' : '0%',
                }}
              />
            </div>

            {/* Step 1: Reported */}
            <div className="relative z-10 flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-md transition-all ${
                  stepIndex >= 1
                    ? 'bg-emerald-800 text-white ring-4 ring-emerald-100 dark:ring-emerald-950'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                }`}
              >
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-900 dark:text-white mt-2">
                Reported
              </span>
              <span className="text-[10px] text-slate-500">Logged to queue</span>
            </div>

            {/* Step 2: In Progress */}
            <div className="relative z-10 flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-md transition-all ${
                  stepIndex >= 2
                    ? 'bg-emerald-800 text-white ring-4 ring-emerald-100 dark:ring-emerald-950'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                }`}
              >
                {stepIndex === 2 ? (
                  <Wrench className="w-5 h-5 animate-spin" />
                ) : stepIndex > 2 ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <span>2</span>
                )}
              </div>
              <span className="text-xs font-bold text-slate-900 dark:text-white mt-2">
                In Progress
              </span>
              <span className="text-[10px] text-slate-500">Field crew assigned</span>
            </div>

            {/* Step 3: Resolved */}
            <div className="relative z-10 flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-md transition-all ${
                  stepIndex === 3
                    ? 'bg-emerald-600 text-white ring-4 ring-emerald-100 dark:ring-emerald-950'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                }`}
              >
                {stepIndex === 3 ? <CheckCircle2 className="w-5 h-5" /> : <span>3</span>}
              </div>
              <span className="text-xs font-bold text-slate-900 dark:text-white mt-2">
                Resolved
              </span>
              <span className="text-[10px] text-slate-500">Repairs completed</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Complaint Details & Timeline (2 cols) */}
        <div className="md:col-span-2 space-y-6">
          {/* Description & Photo */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Citizen Description
            </h3>
            <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed mb-4">
              {issue.description}
            </p>

            {issue.image_url && (
              <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 max-h-72 bg-slate-950 flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={issue.image_url}
                  alt={issue.title}
                  className="w-full h-full object-contain max-h-72"
                />
              </div>
            )}
          </div>

          {/* Status History Timeline */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-emerald-600" />
              Redressal Status History
            </h3>

            <div className="space-y-4 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
              {issue.history.map((entry) => (
                <div key={entry.id} className="relative pl-8">
                  {/* Dot */}
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

        {/* Right Column: AI Triage Summary & Map (1 col) */}
        <div className="space-y-6">
          {/* Gemini AI Triage Summary Card */}
          {issue.ai_analysis && (
            <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50/80 to-teal-50/40 dark:from-slate-900 dark:to-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800/60 shadow-sm">
              <div className="flex items-center gap-1.5 text-xs font-extrabold text-emerald-900 dark:text-emerald-300 mb-3">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>AI Triage Summary</span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 block">
                    Urgency Assessment
                  </span>
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    {issue.ai_analysis.urgency_score}/100 • {issue.ai_analysis.priority}
                  </span>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                    {issue.ai_analysis.priority_reasoning}
                  </p>
                </div>

                <div className="pt-2 border-t border-emerald-200/60 dark:border-slate-800">
                  <span className="text-[11px] font-semibold text-slate-500 block">
                    Target SLA Window
                  </span>
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    {issue.ai_analysis.suggested_sla_hours} Hours from filing
                  </span>
                </div>

                <div className="pt-2 border-t border-emerald-200/60 dark:border-slate-800">
                  <span className="text-[11px] font-semibold text-slate-500 block">
                    Recommended Field Action
                  </span>
                  <span className="text-[11px] text-slate-700 dark:text-slate-300">
                    {issue.ai_analysis.recommended_action}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Interactive Incident Map Pin */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              Incident Location
            </h3>
            <p className="text-xs text-slate-700 dark:text-slate-300 mb-3 font-medium">
              {issue.address}
            </p>
            <SinglePinMap
              latitude={issue.latitude}
              longitude={issue.longitude}
              title={issue.title}
              address={issue.address}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
