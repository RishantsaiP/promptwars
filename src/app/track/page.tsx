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
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-lg mx-auto w-full text-center animate-fade-in-up">
      <div className="relative overflow-hidden rounded-[32px] atmosphere text-[#f4ede0] p-8 sm:p-10 mb-8 border border-white/15 shadow-2xl">
        <div className="fluted-glass-overlay absolute inset-0 pointer-events-none opacity-30" />

        <div className="relative z-10">
          <div className="w-14 h-14 rounded-full bg-white/10 text-[#ff6b5b] border border-white/15 flex items-center justify-center mx-auto mb-4 shadow-inner">
            <Search className="w-6 h-6" />
          </div>

          <h1 className="text-3xl sm:text-4xl font-light text-white tracking-tight mb-2">
            Track Your <span className="font-normal italic text-[#ff6b5b]">Grievance</span>
          </h1>
          <p className="text-xs sm:text-sm text-white/70 mb-6">
            Enter the tracking code provided when you filed your complaint to inspect live municipal status.
          </p>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="relative">
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. CR-2026-0001"
                className="w-full min-h-[50px] px-5 text-base sm:text-lg font-mono font-bold uppercase rounded-full border border-white/20 bg-white/10 text-white placeholder:text-white/40 focus:ring-2 focus:ring-[#ff6b5b] focus:border-transparent outline-none text-center tracking-widest shadow-inner backdrop-blur"
                required
              />
            </div>

            <button
              type="submit"
              className="btn-coral w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-full font-bold text-sm min-h-[48px] shadow-lg shadow-[#ff6b5b]/25 active:scale-[0.98] transition-all"
            >
              <span>Track Municipal Status</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* Quick Test Samples */}
      <div className="p-5 rounded-[24px] bg-[#fcf9f4] dark:bg-white/[0.04] border border-[#14213d]/10 dark:border-white/10 text-left shadow-sm">
        <span className="text-[11px] font-bold text-[#14213d]/60 dark:text-[#f4ede0]/60 uppercase tracking-wider block mb-2.5">
          Demo Quick Samples:
        </span>
        <div className="flex flex-wrap gap-2">
          {sampleCodes.map((c) => (
            <button
              key={c}
              onClick={() => router.push(`/track/${c}`)}
              className="px-3 py-1.5 rounded-full bg-white dark:bg-white/10 border border-[#14213d]/15 dark:border-white/15 text-xs font-mono font-semibold text-[#14213d] dark:text-[#f4ede0] hover:border-[#ff6b5b] hover:text-[#ff6b5b] transition-all shadow-2xs"
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
        <div className="py-20 flex justify-center text-[#ff6b5b]">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      }
    >
      <TrackSearchContent />
    </Suspense>
  );
}
