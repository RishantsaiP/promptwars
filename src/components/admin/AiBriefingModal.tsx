'use client';

import React, { useState } from 'react';
import { Sparkles, Loader2, X, CheckCircle, AlertTriangle, ShieldCheck } from 'lucide-react';

export function AiBriefingModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [briefing, setBriefing] = useState<string[] | null>(null);
  const [generatedBy, setGeneratedBy] = useState<string>('gemini');

  const fetchBriefing = async () => {
    setIsOpen(true);
    if (briefing) return; // already loaded

    setLoading(true);
    try {
      const res = await fetch('/api/admin/briefing', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setBriefing(data.briefing || []);
        setGeneratedBy(data.generated_by || 'gemini');
      }
    } catch (err) {
      console.error('Failed to generate AI briefing:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={fetchBriefing}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-700 to-teal-700 hover:from-emerald-800 hover:to-teal-800 shadow-md transition-all active:scale-95"
      >
        <Sparkles className="w-4 h-4 text-emerald-300" />
        <span>Generate AI Operations Briefing</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl relative">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center justify-center font-bold">
                <Sparkles className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
                  Executive Operations Backlog Briefing
                </h3>
                <p className="text-xs text-slate-500">
                  Synthesized across all active Coimbatore Corporation complaints
                </p>
              </div>
            </div>

            {loading ? (
              <div className="py-16 flex flex-col items-center justify-center gap-3 text-slate-400">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
                <span className="text-xs font-medium">
                  Gemini is analyzing open complaints and field workload...
                </span>
              </div>
            ) : briefing ? (
              <div className="space-y-4">
                <div className="space-y-3">
                  {briefing.map((bullet, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-start gap-3"
                    >
                      <span className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                        {bullet}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Generated via {generatedBy === 'gemini' ? 'Gemini 2.5 Flash' : 'Rule-based analyzer'}
                  </span>
                  <button
                    onClick={() => {
                      setBriefing(null);
                      fetchBriefing();
                    }}
                    className="font-semibold text-emerald-700 hover:underline"
                  >
                    Refresh Briefing
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </>
  );
}
