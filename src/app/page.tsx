import React from 'react';
import Link from 'next/link';
import {
  ShieldAlert,
  ArrowRight,
  Search,
  CheckCircle2,
  Clock,
  Wrench,
  Sparkles,
  Camera,
  MapPin,
  TrendingUp,
  Building2,
} from 'lucide-react';
import { getRepository } from '@/lib/db';
import { PriorityBadge } from '@/components/ui/PriorityBadge';
import { StatusBadge } from '@/components/ui/StatusBadge';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const repo = getRepository();
  const stats = repo.getStats();
  const recentIssues = repo.list({ limit: 4, sort_by: 'created_at', sort_order: 'desc' }).issues;

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-950 via-slate-900 to-slate-950 text-white pt-14 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#2dd4bf_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-900/60 border border-emerald-500/30 text-emerald-300 text-xs font-semibold mb-6 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Google Gemini Multimodal AI Triage System</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight">
            Fix your street with{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200">
              AI-Powered
            </span>{' '}
            Civic Triage
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            Report potholes, overflowing garbage bins, broken streetlights, or drainage overflow.
            Gemini instantly categorizes, estimates urgency, and dispatches to the right municipal department.
          </p>

          {/* Primary CTAs & Tracking Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-xl mx-auto mb-12">
            <Link
              href="/report"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-bold text-base text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-300 hover:from-emerald-300 hover:to-teal-200 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
            >
              <Camera className="w-5 h-5 text-slate-950" />
              <span>Report an Issue</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>

            {/* Tracking Code Form */}
            <form
              action="/track"
              method="GET"
              className="w-full sm:w-auto flex items-center bg-white/10 backdrop-blur-md rounded-xl p-1.5 border border-white/20 shadow-md focus-within:border-emerald-400"
            >
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  name="code"
                  placeholder="Enter tracking code (e.g. CR-2026-0001)"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-transparent text-white placeholder-slate-400 outline-none uppercase font-mono"
                  required
                />
              </div>
              <button
                type="submit"
                className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors shrink-0"
              >
                Track
              </button>
            </form>
          </div>

          {/* Live Stats Counter Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto pt-6 border-t border-slate-800/80">
            <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/50 backdrop-blur text-center">
              <span className="block text-2xl font-extrabold text-white">{stats.total}</span>
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Total Filed</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/50 backdrop-blur text-center">
              <span className="block text-2xl font-extrabold text-amber-400">{stats.in_progress}</span>
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">In Progress</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/50 backdrop-blur text-center">
              <span className="block text-2xl font-extrabold text-emerald-400">{stats.resolved}</span>
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Resolved</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/50 backdrop-blur text-center">
              <span className="block text-2xl font-extrabold text-teal-300">{stats.avg_resolution_hours}h</span>
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Avg Resolution</span>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works: Delivery Stepper Metaphor */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Civic Redressal as Simple as Delivery Tracking
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
            AI handles the heavy classification; humans make the decisions; citizens stay informed in real-time.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center justify-center mb-4 font-bold text-lg">
              1
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white mb-2">
              Snap & Describe
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Upload a photo from your phone. Type in English, Tamil, or Hindi. The GPS coordinates pin your exact location in Coimbatore.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 flex items-center justify-center mb-4 font-bold text-lg">
              2
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white mb-2">
              Gemini AI Triage
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Google Gemini inspects the photo, assigns a priority score (0-100), extracts safety hazards, and routes it to the right department.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 flex items-center justify-center mb-4 font-bold text-lg">
              3
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white mb-2">
              Track to Resolution
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Watch your grievance move through Reported → In Progress → Resolved with status history, supervisor notes, and crew verification.
            </p>
          </div>
        </div>
      </section>

      {/* Recent Issues / Live Feed */}
      <section className="bg-slate-100/70 dark:bg-slate-900/40 py-16 px-4 sm:px-6 lg:px-8 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                Live Grievance Activity
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Real complaints processed across Coimbatore Corporation wards
              </p>
            </div>
            <Link
              href="/admin/issues"
              className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1"
            >
              <span>Explore all complaints in queue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recentIssues.map((issue) => (
              <div
                key={issue.id}
                className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-emerald-500/50 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-mono text-xs font-bold text-slate-500">
                      {issue.tracking_code}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <PriorityBadge priority={issue.final_priority} />
                      <StatusBadge status={issue.status} />
                    </div>
                  </div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1 mb-1">
                    {issue.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mb-3">
                    {issue.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-emerald-600" />
                    <span className="truncate max-w-[200px]">{issue.address}</span>
                  </span>
                  <Link
                    href={`/track/${issue.tracking_code}`}
                    className="font-semibold text-emerald-700 dark:text-emerald-400 hover:underline shrink-0"
                  >
                    Track Progress →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Callout Banner */}
      <section className="py-14 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center w-full">
        <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-tr from-emerald-900 via-emerald-800 to-teal-800 text-white shadow-xl">
          <h2 className="text-2xl sm:text-3xl font-extrabold mb-3">
            See a damaged road, broken light, or leaking water pipe?
          </h2>
          <p className="text-emerald-100 text-sm max-w-xl mx-auto mb-6">
            Take 30 seconds to snap a picture. Our Gemini AI triage model takes care of the rest.
          </p>
          <Link
            href="/report"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-slate-900 bg-white hover:bg-emerald-50 shadow-md active:scale-95 transition-all text-sm"
          >
            <Camera className="w-4 h-4 text-emerald-800" />
            <span>File a Grievance Now</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
