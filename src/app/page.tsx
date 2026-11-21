import React from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Search,
  Sparkles,
  Camera,
  MapPin,
  Clock,
  Mic,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { getRepository } from '@/lib/db';
import { PriorityBadge } from '@/components/ui/PriorityBadge';
import { StatusBadge } from '@/components/ui/StatusBadge';

export const dynamic = 'force-dynamic';

/** Format a duration between two ISO date strings into a human label like "3h 12m" or "2d 4h" */
function formatDuration(from: string, to: string): string {
  const ms = new Date(to).getTime() - new Date(from).getTime();
  if (ms <= 0) return '< 1 min';
  const totalMins = Math.floor(ms / 60000);
  const days = Math.floor(totalMins / 1440);
  const hours = Math.floor((totalMins % 1440) / 60);
  const mins = totalMins % 60;
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins} min`;
}

export default async function HomePage() {
  const repo = getRepository();
  const stats = repo.getStats();

  // Retrieve issues: prefer one Critical/High + one lower priority for the triage panel
  const queueResult = repo.list({ limit: 20, sort_by: 'urgency_score', sort_order: 'desc' });
  const all = queueResult.issues;
  const critical = all.find((i) => i.final_priority === 'Critical' || i.final_priority === 'High');
  const lower = all.find(
    (i) => i.id !== critical?.id && (i.final_priority === 'Medium' || i.final_priority === 'Low')
  );
  const liveTriageIssues = [critical, lower].filter(Boolean).slice(0, 2) as typeof all;

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Atmosphere Section (Navy-to-Coral Gradient + Fluted Glass Texture) */}
      <section className="relative overflow-hidden atmosphere text-[#f4ede0] pt-28 pb-16 px-4 sm:px-6 lg:px-8 border-b border-white/10">
        {/* Architectural vertical fluted glass overlay */}
        <div className="fluted-glass-overlay" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Column: Asymmetrical Editorial Display */}
            <div className="lg:col-span-7 space-y-6 text-left">
              {/* Civic Tag – sans font, sentence case, light tracking */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-[#f4ede0]/80 text-xs font-medium">
                <span className="w-2 h-2 rounded-full bg-[#ff6b5b] shrink-0" />
                <span>Coimbatore Grievance Portal</span>
                <span className="text-white/30">|</span>
                <span className="text-[#f4ede0]/70">AI‑powered triage</span>
              </div>

              {/* Very Large Light-Weight Grotesque Headline */}
              <h1 className="text-4xl sm:text-6xl lg:text-[4.75rem] font-light tracking-[-0.035em] text-[#f4ede0] leading-[1.08] [text-wrap:balance]">
                Your street, <br className="hidden sm:inline" />
                <span className="font-normal text-transparent bg-clip-text bg-gradient-to-r from-[#f4ede0] via-[#ffd4cc] to-[#ff6b5b]">
                  fixed faster.
                </span>
              </h1>

              {/* Two-line Editorial Subcopy */}
              <p className="text-sm sm:text-base text-[#f4ede0]/70 max-w-xl leading-relaxed font-light">
                Citizens report road craters, broken streetlights, and sanitation hazards.
                Google Gemini triages urgency in seconds, dispatching directly to municipal crews.
              </p>

              {/* Action Strip: Coral Pill CTA + Wide Tracking Search */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 max-w-2xl">
                {/* Primary Coral Pill CTA */}
                <Link
                  href="/report"
                  className="btn-coral inline-flex items-center justify-center gap-2 px-7 py-3.5 text-sm font-bold shadow-lg shrink-0"
                >
                  <Camera className="w-4 h-4 text-[#14213d]" />
                  <span>Report an issue</span>
                  <ArrowRight className="w-4 h-4 ml-0.5 text-[#14213d]" />
                </Link>

                {/* Tracking Code Input – sans placeholder, mono input value */}
                <form
                  action="/track"
                  method="GET"
                  className="flex-1 flex items-center bg-white/10 backdrop-blur-md rounded-full px-3 py-1.5 border border-white/20 shadow-inner focus-within:border-[#ff6b5b] transition-colors"
                >
                  <Search className="w-4 h-4 text-[#f4ede0]/50 ml-2 shrink-0" />
                  <input
                    type="text"
                    name="code"
                    placeholder="Enter tracking code…"
                    className="w-full px-3 py-2 text-xs bg-transparent text-[#f4ede0] placeholder-[#f4ede0]/40 outline-none font-mono tracking-wider min-w-[180px]"
                    required
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-full bg-white/15 hover:bg-white/25 text-[#f4ede0] font-semibold text-xs transition-colors shrink-0"
                  >
                    Track
                  </button>
                </form>
              </div>
            </div>

            {/* Right Column: Floating Glass "Live Triage" Card */}
            <div className="lg:col-span-5">
              <div className="glass rounded-[28px] p-6 text-[#f4ede0] space-y-4 shadow-2xl relative overflow-hidden border border-white/15">
                {/* Panel Header – live dot, no dark circle */}
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <span className="live-dot" aria-hidden="true" />
                    <span className="text-xs font-semibold text-[#f4ede0]">
                      Live triage dispatch
                    </span>
                  </div>
                  <span className="text-[11px] text-[#f4ede0]/50">Real-time backlog</span>
                </div>

                {/* 2 Real Database Issues – identical structure, left-aligned */}
                <div className="space-y-3">
                  {liveTriageIssues.map((issue) => {
                    const isResolved = issue.status === 'Resolved';
                    const resolvedLabel = isResolved && issue.updated_at
                      ? `Resolved in ${formatDuration(issue.created_at, issue.updated_at)}`
                      : `${issue.ai_analysis?.suggested_sla_hours ?? 24}h SLA`;
                    const shortAddress = issue.address.split(',')[0];

                    return (
                      <div
                        key={issue.id}
                        className="p-4 rounded-2xl bg-white/[0.06] border border-white/10 hover:border-[#ff6b5b]/40 transition-colors"
                      >
                        {/* Row 1: tracking code + badges */}
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span className="font-mono text-[11px] font-bold text-[#f4ede0]/50">
                            {issue.tracking_code}
                          </span>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <PriorityBadge priority={issue.final_priority} />
                            <StatusBadge status={issue.status} />
                          </div>
                        </div>

                        {/* Row 2: title */}
                        <h4 className="font-semibold text-xs text-[#f4ede0] line-clamp-1 mb-2">
                          {issue.title}
                        </h4>

                        {/* Row 3: pin + address | SLA or resolved duration */}
                        <div className="flex items-center justify-between text-[11px] text-[#f4ede0]/50 pt-1.5 border-t border-white/5">
                          <span
                            className="flex items-center gap-1 min-w-0"
                            title={issue.address}
                          >
                            <MapPin className="w-3 h-3 text-[#ff6b5b] shrink-0" />
                            <span className="truncate max-w-[160px]">{shortAddress}</span>
                          </span>
                          <span className={`font-mono text-[10px] shrink-0 ml-2 ${isResolved ? 'text-[#86efac]' : 'text-[#ff6b5b]'}`}>
                            {resolvedLabel}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-2 flex items-center justify-between text-[11px] text-[#f4ede0]/50">
                  <span className="flex items-center gap-1 text-[#f4ede0]/70">
                    <Zap className="w-3.5 h-3.5 text-[#ff6b5b]" />
                    <span>Gemini triage active</span>
                  </span>
                  <Link
                    href="/admin/issues"
                    className="text-xs font-semibold text-[#ff6b5b] hover:underline"
                  >
                    View all reports →
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Coral Hairline Divider */}
          <div className="my-12 h-px w-full bg-gradient-to-r from-transparent via-[#ff6b5b]/40 to-transparent" />

          {/* 4 Live Stat Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
            <div className="glass rounded-2xl p-5 text-center border border-white/10 hover:border-white/20 transition-all">
              <span className="block text-3xl sm:text-4xl font-light text-white font-mono">
                {stats.total}
              </span>
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mt-1 block">
                Total Complaints
              </span>
            </div>

            <div className="glass rounded-2xl p-5 text-center border border-white/10 hover:border-white/20 transition-all">
              <span className="block text-3xl sm:text-4xl font-light text-[#ff6b5b] font-mono">
                {stats.in_progress}
              </span>
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mt-1 block">
                In Progress
              </span>
            </div>

            <div className="glass rounded-2xl p-5 text-center border border-white/10 hover:border-white/20 transition-all">
              <span className="block text-3xl sm:text-4xl font-light text-[#86efac] font-mono">
                {stats.resolved}
              </span>
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mt-1 block">
                Resolved
              </span>
            </div>

            <div className="glass rounded-2xl p-5 text-center border border-white/10 hover:border-white/20 transition-all">
              <span className="block text-3xl sm:text-4xl font-light text-slate-200 font-mono">
                {stats.avg_resolution_hours}h
              </span>
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mt-1 block">
                Avg Resolution SLA
              </span>
            </div>
          </div>

          {/* 5-Item Icon Feature Strip (Only actual verified features) */}
          <div className="mt-12 pt-8 border-t border-white/10 flex flex-wrap items-center justify-between gap-6 text-xs text-slate-300 max-w-6xl mx-auto">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#ff6b5b]" />
              <span>Multimodal Gemini Triage</span>
            </div>
            <div className="flex items-center gap-2">
              <Mic className="w-4 h-4 text-[#ff6b5b]" />
              <span>Voice Dictate in Tamil, Hindi & EN</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#ff6b5b]" />
              <span>OpenStreetMap GPS Location</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#ff6b5b]" />
              <span>Delivery-Style Stepper Tracking</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#ff6b5b]" />
              <span>Human Supervisory Control</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Cream "How it works" Section ───────────────────────────── */}
      <section className="cream-surface py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Section header */}
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="cream-pill inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-medium mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ff6b5b]" />
              How it works
            </div>
            <h2 className="text-2xl sm:text-3xl font-light tracking-tight">
              From street to resolution — <span className="font-semibold text-[#ff6b5b]">in three steps</span>
            </h2>
            <p className="text-sm mt-3 font-light leading-relaxed">
              A transparent, AI-assisted workflow that keeps every citizen informed and every crew accountable.
            </p>
          </div>

          {/* Three step cards on cream */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Step 1 */}
            <div className="cream-card-light relative p-7 rounded-[24px] border shadow-sm hover:-translate-y-0.5 transition-all">
              <div className="w-11 h-11 rounded-2xl bg-[#14213d] text-[#f4ede0] flex items-center justify-center mb-5 shadow-md">
                <Camera className="w-5 h-5" />
              </div>
              <div className="step-num-dark absolute top-6 right-6 font-mono text-[11px] font-bold">01</div>
              <h3 className="font-bold text-base mb-2">Snap, speak or type</h3>
              <p className="text-xs leading-relaxed font-light">
                Upload a photo; Gemini reads it automatically. Dictate in Tamil, Hindi or English. Pin your exact spot on the Coimbatore map — no account needed.
              </p>
            </div>

            {/* Step 2 */}
            <div className="cream-card-dark relative p-7 rounded-[24px] shadow-lg hover:-translate-y-0.5 transition-all">
              <div className="w-11 h-11 rounded-2xl bg-[#ff6b5b] text-[#14213d] flex items-center justify-center mb-5 shadow-md">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="step-num-light absolute top-6 right-6 font-mono text-[11px] font-bold">02</div>
              <h3 className="font-bold text-base mb-2">AI triage in seconds</h3>
              <p className="text-xs leading-relaxed font-light">
                Google Gemini scores urgency, detects safety hazards, assigns department jurisdiction, and surfaces duplicate complaints within 100 m — all before you submit.
              </p>
            </div>

            {/* Step 3 */}
            <div className="cream-card-light relative p-7 rounded-[24px] border shadow-sm hover:-translate-y-0.5 transition-all">
              <div className="w-11 h-11 rounded-2xl bg-[#ff6b5b] text-[#14213d] flex items-center justify-center mb-5 shadow-md">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="step-num-dark absolute top-6 right-6 font-mono text-[11px] font-bold">03</div>
              <h3 className="font-bold text-base mb-2">Track until resolved</h3>
              <p className="text-xs leading-relaxed font-light">
                Get a permanent tracking code. Watch your complaint move through Reported → In Progress → Resolved with field notes from municipal crews.
              </p>
            </div>
          </div>

          {/* Coral CTA inside cream section */}
          <div className="mt-12 text-center">
            <Link
              href="/report"
              className="btn-coral inline-flex items-center gap-2 px-8 py-3.5 text-sm font-bold shadow-lg"
            >
              <MapPin className="w-4 h-4 text-[#14213d]" />
              <span>File a complaint now</span>
              <ArrowRight className="w-4 h-4 text-[#14213d]" />
            </Link>
          </div>
        </div>
      </section>

      {/* Community Section: accountability / stats */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-light tracking-tight text-[#14213d] dark:text-[#f4ede0]">
            Civic redressal built for accountability
          </h2>
          <p className="text-xs sm:text-sm text-[#53627a] dark:text-slate-400 mt-2 font-light">
            Every complaint receives an automated triage assessment and permanent tracking code.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-7 rounded-[24px] bg-[#f8f3ec] dark:bg-[#14213d]/60 border border-[rgba(20,33,61,0.1)] dark:border-white/10 shadow-sm transition-all hover:-translate-y-0.5">
            <div className="w-10 h-10 rounded-full bg-[#14213d] text-[#f4ede0] flex items-center justify-center mb-4 font-mono font-bold text-sm">
              01
            </div>
            <h3 className="font-bold text-base text-[#14213d] dark:text-[#f4ede0] mb-2">
              Snap, speak or type
            </h3>
            <p className="text-xs text-[#53627a] dark:text-slate-400 leading-relaxed font-light">
              Upload photos with client-side canvas compression. Speak in Tamil or Hindi via the Web Speech API. Pin your exact spot on the Coimbatore map.
            </p>
          </div>

          <div className="p-7 rounded-[24px] bg-[#f8f3ec] dark:bg-[#14213d]/60 border border-[rgba(20,33,61,0.1)] dark:border-white/10 shadow-sm transition-all hover:-translate-y-0.5">
            <div className="w-10 h-10 rounded-full bg-[#ff6b5b] text-[#14213d] flex items-center justify-center mb-4 font-mono font-bold text-sm">
              02
            </div>
            <h3 className="font-bold text-base text-[#14213d] dark:text-[#f4ede0] mb-2">
              AI triage nurse
            </h3>
            <p className="text-xs text-[#53627a] dark:text-slate-400 leading-relaxed font-light">
              Google Gemini calculates urgency scores, spots safety hazards, assigns department jurisdiction, and detects duplicate complaints within 100 meters.
            </p>
          </div>

          <div className="p-7 rounded-[24px] bg-[#f8f3ec] dark:bg-[#14213d]/60 border border-[rgba(20,33,61,0.1)] dark:border-white/10 shadow-sm transition-all hover:-translate-y-0.5">
            <div className="w-10 h-10 rounded-full bg-[#14213d] text-[#f4ede0] flex items-center justify-center mb-4 font-mono font-bold text-sm">
              03
            </div>
            <h3 className="font-bold text-base text-[#14213d] dark:text-[#f4ede0] mb-2">
              Live delivery stepper
            </h3>
            <p className="text-xs text-[#53627a] dark:text-slate-400 leading-relaxed font-light">
              Watch complaints move through Reported → In Progress → Resolved. Municipal supervisors record field notes and upload crew completion proof.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
