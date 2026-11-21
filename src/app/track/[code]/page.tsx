import React from 'react';
import Link from 'next/link';
import {
  Wrench,
  CheckCircle2,
  MapPin,
  Users,
  Sparkles,
  ArrowLeft,
  Calendar,
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
      <div className="py-16 px-4 max-w-lg mx-auto text-center animate-fade-in-up">
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
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full animate-fade-in-up">
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

      {/* Main Status Header Card with Atmosphere Fluted Glass in BOTH themes */}
      <div className="relative overflow-hidden rounded-[32px] atmosphere text-[#f4ede0] p-6 sm:p-10 mb-8 border border-white/15 shadow-2xl">
        <div className="fluted-glass-overlay absolute inset-0 pointer-events-none opacity-30" />

        <div className="relative z-10">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="font-mono text-xs font-semibold px-3 py-1 rounded-full bg-white/10 border border-white/15 text-[#ff6b5b] tracking-wider">
                  {issue.tracking_code}
                </span>
                <span className="text-white/40">•</span>
                <span className="text-xs text-white/80 font-medium">{issue.final_category}</span>
                <span className="text-white/40">•</span>
                <span className="text-xs text-white/60">{issue.final_department}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-light text-white tracking-tight">
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
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-200 text-xs font-medium mb-6">
              <Users className="w-3.5 h-3.5 text-amber-300" />
              <span>{issue.report_count} neighbors reported this incident in Coimbatore</span>
            </div>
          )}

          {/* Delivery-Style 3-Step Stepper: horizontal on desktop, vertical on mobile */}
          <div className="pt-6 pb-2">
            <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between max-w-2xl mx-auto gap-6 sm:gap-0">
              {/* Desktop connecting progress bar */}
              <div className="hidden sm:block absolute left-8 right-8 top-5 -translate-y-1/2 h-0.5 bg-white/15 z-0">
                <div
                  className="h-full bg-[#ff6b5b] transition-all duration-500 shadow-sm shadow-[#ff6b5b]/50"
                  style={{
                    width: stepIndex === 3 ? '100%' : stepIndex === 2 ? '50%' : '0%',
                  }}
                />
              </div>

              {/* Step 1: Reported */}
              <div className="relative z-10 flex flex-row sm:flex-col items-center gap-3 sm:gap-2 w-full sm:w-auto">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-md shrink-0 transition-all ${
                    stepIndex > 1
                      ? 'bg-[#14213d] text-[#f4ede0] ring-2 ring-white/30'
                      : stepIndex === 1
                      ? 'bg-[#ff6b5b] text-[#14213d] ring-4 ring-[#ff6b5b]/30 animate-pulse'
                      : 'bg-[#e6dcce]/20 text-white/50'
                  }`}
                >
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div className="text-left sm:text-center">
                  <span className="text-xs font-bold text-white block">
                    Reported
                  </span>
                  <span className="text-[11px] text-white/60">Logged to civic queue</span>
                </div>
              </div>

              {/* Step 2: In Progress */}
              <div className="relative z-10 flex flex-row sm:flex-col items-center gap-3 sm:gap-2 w-full sm:w-auto">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-md shrink-0 transition-all ${
                    stepIndex > 2
                      ? 'bg-[#14213d] text-[#f4ede0] ring-2 ring-white/30'
                      : stepIndex === 2
                      ? 'bg-[#ff6b5b] text-[#14213d] ring-4 ring-[#ff6b5b]/30 animate-pulse'
                      : 'bg-[#e6dcce]/20 text-white/50'
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
                <div className="text-left sm:text-center">
                  <span className="text-xs font-bold text-white block">
                    In Progress
                  </span>
                  <span className="text-[11px] text-white/60">Field crew dispatched</span>
                </div>
              </div>

              {/* Step 3: Resolved */}
              <div className="relative z-10 flex flex-row sm:flex-col items-center gap-3 sm:gap-2 w-full sm:w-auto">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-md shrink-0 transition-all ${
                    stepIndex === 3
                      ? 'bg-[#ff6b5b] text-[#14213d] ring-4 ring-[#ff6b5b]/30'
                      : 'bg-[#e6dcce]/20 text-white/50'
                  }`}
                >
                  {stepIndex === 3 ? <CheckCircle2 className="w-5 h-5" /> : <span>3</span>}
                </div>
                <div className="text-left sm:text-center">
                  <span className="text-xs font-bold text-white block">
                    Resolved
                  </span>
                  <span className="text-[11px] text-white/60">Repairs completed</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Complaint Details & Timeline (2 cols) */}
        <div className="md:col-span-2 space-y-6">
          {/* Description & Photo */}
          <div className="p-6 rounded-[24px] bg-[#fcf9f4] dark:bg-white/[0.04] border border-[#14213d]/10 dark:border-white/10 shadow-sm">
            <h3 className="text-xs font-bold text-[#14213d]/60 dark:text-[#f4ede0]/60 uppercase tracking-wider mb-2">
              Citizen Description
            </h3>
            <p className="text-sm text-[#14213d] dark:text-[#f4ede0] leading-relaxed mb-4">
              {issue.description}
            </p>

            {issue.image_url && (
              <div className="rounded-[20px] overflow-hidden border border-[#14213d]/15 dark:border-white/15 max-h-72 bg-[#14213d] flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={issue.image_url}
                  alt={issue.title}
                  className="w-full h-full object-contain max-h-72"
                />
              </div>
            )}
          </div>

          {/* Status History Timeline Cards */}
          <div className="p-6 rounded-[24px] bg-[#fcf9f4] dark:bg-white/[0.04] border border-[#14213d]/10 dark:border-white/10 shadow-sm">
            <h3 className="text-xs font-bold text-[#14213d]/60 dark:text-[#f4ede0]/60 uppercase tracking-wider mb-5 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#ff6b5b]" />
              Redressal Status History
            </h3>

            <div className="space-y-4 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#14213d]/15 dark:before:bg-white/15">
              {issue.history.map((entry) => (
                <div key={entry.id} className="relative pl-8">
                  {/* Dot */}
                  <div className="absolute left-1.5 top-1.5 w-3.5 h-3.5 rounded-full bg-[#ff6b5b] ring-4 ring-[#fcf9f4] dark:ring-[#14213d] -translate-x-1/2" />
                  <div className="p-3.5 rounded-[18px] bg-white/70 dark:bg-white/[0.03] border border-[#14213d]/10 dark:border-white/10">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-[#14213d] dark:text-[#f4ede0]">
                        {entry.status}
                      </span>
                      <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-[#14213d]/10 dark:bg-white/10 text-[#14213d] dark:text-[#f4ede0]">
                        {entry.actor}
                      </span>
                      <span className="text-[10px] text-[#14213d]/50 dark:text-[#f4ede0]/50 font-mono">
                        {new Date(entry.timestamp).toLocaleString('en-IN', {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
                      </span>
                    </div>
                    <p className="text-xs text-[#14213d]/80 dark:text-[#f4ede0]/80">
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
            <div className="p-6 rounded-[24px] bg-[#fcf9f4] dark:bg-white/[0.04] border border-[#ff6b5b]/30 shadow-sm relative overflow-hidden">
              <div className="flex items-center gap-2 text-xs font-bold text-[#14213d] dark:text-[#f4ede0] mb-3">
                <Sparkles className="w-4 h-4 text-[#ff6b5b]" />
                <span>AI Triage Summary</span>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-[11px] font-semibold text-[#14213d]/60 dark:text-[#f4ede0]/60 block mb-0.5">
                    Urgency Assessment
                  </span>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-base font-bold text-[#14213d] dark:text-[#f4ede0] font-mono">
                      {issue.ai_analysis.urgency_score}/100
                    </span>
                    <PriorityBadge priority={issue.ai_analysis.priority} />
                  </div>
                  <p className="text-xs text-[#14213d]/70 dark:text-[#f4ede0]/70 leading-relaxed">
                    {issue.ai_analysis.priority_reasoning}
                  </p>
                </div>

                <div className="pt-2.5 border-t border-[#14213d]/10 dark:border-white/10">
                  <span className="text-[11px] font-semibold text-[#14213d]/60 dark:text-[#f4ede0]/60 block mb-0.5">
                    Target SLA Window
                  </span>
                  <span className="text-xs font-bold text-[#14213d] dark:text-[#f4ede0]">
                    {issue.ai_analysis.suggested_sla_hours} Hours from filing
                  </span>
                </div>

                <div className="pt-2.5 border-t border-[#14213d]/10 dark:border-white/10">
                  <span className="text-[11px] font-semibold text-[#14213d]/60 dark:text-[#f4ede0]/60 block mb-0.5">
                    Recommended Field Action
                  </span>
                  <span className="text-xs text-[#14213d]/80 dark:text-[#f4ede0]/80 leading-relaxed block">
                    {issue.ai_analysis.recommended_action}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Interactive Incident Map Pin */}
          <div className="p-6 rounded-[24px] bg-[#fcf9f4] dark:bg-white/[0.04] border border-[#14213d]/10 dark:border-white/10 shadow-sm">
            <h3 className="text-xs font-bold text-[#14213d]/60 dark:text-[#f4ede0]/60 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-[#ff6b5b]" />
              Incident Location
            </h3>
            <p className="text-xs text-[#14213d] dark:text-[#f4ede0] mb-3 font-medium">
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
