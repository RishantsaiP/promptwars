'use client';

import React, { useState } from 'react';
import { Sparkles, Loader2, X, ShieldCheck, AlertCircle, RefreshCw } from 'lucide-react';

export function AiBriefingModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [briefing, setBriefing] = useState<string[] | null>(null);
  const [generatedBy, setGeneratedBy] = useState<string>('gemini');
  const [error, setError] = useState<string | null>(null);

  const fetchBriefing = async (force = false) => {
    setIsOpen(true);
    if (briefing && !force) return; // already loaded, don't re-fetch

    setLoading(true);
    setError(null);
    setBriefing(null);

    try {
      const res = await fetch('/api/admin/briefing', { method: 'POST' });

      if (res.status === 401) {
        setError('Session expired. Please sign in again to the admin portal.');
        setLoading(false);
        return;
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || `Server error (${res.status}). Please try again.`);
        setLoading(false);
        return;
      }

      const data = await res.json();
      if (!data.briefing || !Array.isArray(data.briefing) || data.briefing.length === 0) {
        setError('Received an empty briefing from the server. Please retry.');
        setLoading(false);
        return;
      }

      setBriefing(data.briefing);
      setGeneratedBy(data.generated_by || 'gemini');
    } catch (err) {
      console.error('Failed to generate AI briefing:', err);
      setError('Network error — could not reach the briefing API. Check your connection and retry.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <>
      <button
        onClick={() => fetchBriefing(false)}
        className="btn-coral inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold shadow-md shadow-[#ff6b5b]/20 transition-all active:scale-95"
      >
        <Sparkles className="w-4 h-4 text-[#14213d]" />
        <span>Generate AI Operations Briefing</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#14213d]/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-[#fcf9f4] dark:bg-[#14213d] rounded-[32px] p-6 sm:p-8 border border-[#14213d]/15 dark:border-white/15 shadow-2xl relative text-[#14213d] dark:text-[#f4ede0]">
            {/* Close */}
            <button
              onClick={handleClose}
              className="absolute top-6 right-6 p-2 rounded-full text-[#14213d]/60 dark:text-[#f4ede0]/60 hover:text-[#ff6b5b] dark:hover:text-[#ff6b5b] transition-colors"
              aria-label="Close briefing"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-[#ff6b5b]/20 text-[#ff6b5b] flex items-center justify-center font-bold">
                <Sparkles className="w-5 h-5 text-[#ff6b5b]" />
              </div>
              <div>
                <h3 className="font-light text-xl text-[#14213d] dark:text-[#f4ede0]">
                  Executive Operations <span className="font-normal italic text-[#ff6b5b]">Backlog Briefing</span>
                </h3>
                <p className="text-xs text-[#14213d]/60 dark:text-[#f4ede0]/60">
                  Synthesized across all active Coimbatore Corporation complaints
                </p>
              </div>
            </div>

            {/* Loading */}
            {loading && (
              <div className="py-16 flex flex-col items-center justify-center gap-3 text-[#ff6b5b]">
                <Loader2 className="w-8 h-8 animate-spin" />
                <span className="text-xs font-medium text-[#14213d]/60 dark:text-[#f4ede0]/60">
                  Gemini is analyzing open complaints and field workload…
                </span>
              </div>
            )}

            {/* Error state */}
            {!loading && error && (
              <div className="py-8 flex flex-col items-center justify-center gap-4">
                <div className="p-4 rounded-[20px] bg-[#991b1b]/10 border border-[#991b1b]/30 flex items-start gap-3 w-full">
                  <AlertCircle className="w-5 h-5 text-[#991b1b] shrink-0 mt-0.5" />
                  <p className="text-sm text-[#991b1b] dark:text-[#fca5a5] leading-relaxed">{error}</p>
                </div>
                <button
                  onClick={() => fetchBriefing(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold bg-[#14213d] text-white hover:bg-[#ff6b5b] hover:text-[#14213d] transition-all"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Retry
                </button>
              </div>
            )}

            {/* Briefing bullets */}
            {!loading && !error && briefing && (
              <div className="space-y-4">
                <div className="space-y-3">
                  {briefing.map((bullet, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-[20px] bg-white/80 dark:bg-white/[0.03] border border-[#14213d]/10 dark:border-white/10 flex items-start gap-3"
                    >
                      <span className="w-6 h-6 rounded-full bg-[#ff6b5b] text-[#14213d] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <p className="text-xs sm:text-sm text-[#14213d] dark:text-[#f4ede0] leading-relaxed font-medium">
                        {bullet}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-[#14213d]/10 dark:border-white/10 flex items-center justify-between text-xs text-[#14213d]/60 dark:text-[#f4ede0]/60">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#ff6b5b]" />
                    Generated via {generatedBy === 'gemini' ? 'Gemini AI' : generatedBy === 'system' ? 'System (all resolved)' : 'Rule-based analyzer'}
                  </span>
                  <button
                    onClick={() => fetchBriefing(true)}
                    className="font-bold text-[#14213d] dark:text-[#f4ede0] hover:text-[#ff6b5b] dark:hover:text-[#ff6b5b] transition-colors flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Refresh
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
