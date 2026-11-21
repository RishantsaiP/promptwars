'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import {
  CheckCircle2,
  Copy,
  Check,
  Search,
  PlusCircle,
  Share2,
  Users,
  ArrowRight,
  Loader2,
} from 'lucide-react';

function SuccessContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const code = (params.code as string) || '';
  const isDuplicate = searchParams.get('duplicate') === 'true';
  const parentCode = searchParams.get('parent');

  const [copied, setCopied] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const trackingUrl = typeof window !== 'undefined' ? `${window.location.origin}/track/${code}` : `/track/${code}`;

  const copyCodeToClipboard = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyLinkToClipboard = () => {
    navigator.clipboard.writeText(trackingUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-xl mx-auto w-full text-center">
      {/* Atmosphere Hero Card */}
      <div className="relative overflow-hidden rounded-[32px] atmosphere text-[#f4ede0] p-8 sm:p-10 mb-8 border border-white/15 shadow-2xl">
        <div className="fluted-glass-overlay absolute inset-0 pointer-events-none opacity-30" />

        <div className="relative z-10">
          {/* Success Icon */}
          <div className="w-16 h-16 rounded-full bg-white/10 text-[#ff6b5b] border border-white/15 flex items-center justify-center mx-auto mb-5 shadow-inner">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <h1 className="text-3xl sm:text-4xl font-light text-white tracking-tight mb-2">
            Grievance <span className="font-normal italic text-[#ff6b5b]">Registered</span>
          </h1>
          <p className="text-xs sm:text-sm text-white/70 mb-6">
            Dispatched to Coimbatore Municipal Corporation AI triage registry.
          </p>

          {/* Tracking Code Highlight Card */}
          <div className="p-6 rounded-[24px] bg-white/10 backdrop-blur border border-white/20 shadow-inner mb-6">
            <span className="text-[11px] font-bold text-white/60 uppercase tracking-widest block mb-2">
              Your Grievance Tracking Code
            </span>
            <div className="flex items-center justify-center gap-3 my-2">
              <span className="font-mono text-3xl sm:text-4xl font-extrabold text-[#ff6b5b] tracking-wider">
                {code}
              </span>
              <button
                onClick={copyCodeToClipboard}
                className="p-2.5 rounded-full bg-white/15 hover:bg-[#ff6b5b] hover:text-[#14213d] text-white transition-all shadow-sm"
                title="Copy code"
              >
                {copied ? <Check className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
            <p className="text-xs text-white/60">
              Save this code to check delivery status or share with neighborhood groups.
            </p>

            {/* Copy Shareable Link */}
            <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-center">
              <button
                onClick={copyLinkToClipboard}
                className="inline-flex items-center gap-2 text-xs font-semibold text-white/80 hover:text-[#ff6b5b] transition-colors"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>{copiedLink ? 'Link Copied to Clipboard!' : 'Copy Shareable Tracking Link'}</span>
              </button>
            </div>
          </div>

          {/* Primary Navigation Actions */}
          <div className="space-y-3">
            <Link
              href={`/track/${code}`}
              className="btn-coral w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-full font-bold text-sm min-h-[48px] shadow-lg shadow-[#ff6b5b]/25 active:scale-[0.98] transition-all"
            >
              <Search className="w-4 h-4" />
              <span>Track Grievance Delivery Progress</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>

            <Link
              href="/report"
              className="w-full inline-flex items-center justify-center gap-2 py-3 px-6 rounded-full font-semibold text-xs sm:text-sm bg-white/10 hover:bg-white/20 text-white border border-white/15 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Report Another Issue</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Duplicate Community Signal Notice */}
      {isDuplicate && (
        <div className="p-5 rounded-[24px] bg-amber-500/10 border border-amber-500/30 text-left mb-6 flex items-start gap-3">
          <Users className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div className="text-xs text-[#14213d] dark:text-[#f4ede0]">
            <strong className="block font-bold text-amber-700 dark:text-amber-400 mb-1">
              Similar Issue Already Reported Nearby
            </strong>
            <span>
              Your report was matched with parent complaint{' '}
              <Link href={`/track/${parentCode}`} className="font-mono underline font-bold text-[#ff6b5b]">
                {parentCode}
              </Link>
              . Community report weight has been incremented to accelerate ward intervention!
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="py-20 flex justify-center text-[#ff6b5b]">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
