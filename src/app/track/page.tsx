'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, ArrowRight, Loader2 } from 'lucide-react';

function TrackSearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [code, setCode] = useState('');

  useEffect(() => {
    const codeParam = searchParams.get('code');
    if (codeParam && codeParam.trim()) {
      router.push(`/track/${codeParam.trim().toUpperCase()}`);
    }
  }, [searchParams, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim()) {
      router.push(`/track/${code.trim().toUpperCase()}`);
    }
  };

  const sampleCodes = ['CR-2026-0001', 'CR-2026-0002', 'CR-2026-0003', 'CR-2026-0005'];

  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8 max-w-lg mx-auto w-full text-center">
      <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center justify-center mx-auto mb-4 shadow-sm">
        <Search className="w-7 h-7" />
      </div>

      <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">
        Track Your Grievance
      </h1>
      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-8">
        Enter the tracking code provided when you filed your complaint to inspect live municipal status.
      </p>

      <form onSubmit={handleSubmit} className="space-y-3 mb-8">
        <div className="relative">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="e.g. CR-2026-0001"
            className="w-full p-3.5 pl-4 pr-12 text-sm sm:text-base font-mono font-bold uppercase rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none text-center tracking-wider shadow-sm"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full inline-flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-bold text-sm text-white bg-emerald-800 hover:bg-emerald-900 shadow-md active:scale-98 transition-all"
        >
          <span>Track Status</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      {/* Quick Test Samples */}
      <div className="p-4 rounded-xl bg-slate-100/70 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-left">
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide block mb-2">
          Demo Quick Samples:
        </span>
        <div className="flex flex-wrap gap-2">
          {sampleCodes.map((c) => (
            <button
              key={c}
              onClick={() => router.push(`/track/${c}`)}
              className="px-2.5 py-1 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono font-semibold text-emerald-800 dark:text-emerald-400 hover:border-emerald-500 transition-colors"
            >
              {c}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function TrackPage() {
  return (
    <Suspense
      fallback={
        <div className="py-20 flex justify-center text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        </div>
      }
    >
      <TrackSearchContent />
    </Suspense>
  );
}
