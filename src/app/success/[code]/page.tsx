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
      {/* Success Icon */}
      <div className="w-16 h-16 rounded-3xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-emerald-500/10">
        <CheckCircle2 className="w-9 h-9" />
      </div>

      <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">
        Grievance Successfully Registered
      </h1>
      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-6">
        Dispatched to Coimbatore Municipal Corporation AI triage registry.
      </p>

      {/* Duplicate Community Signal Notice */}
      {isDuplicate && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-left mb-6 flex items-start gap-3">
          <Users className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900 dark:text-amber-200">
            <strong className="block font-bold">Similar Issue Already Reported Nearby</strong>
            <span>
              Your report was matched with parent complaint{' '}
              <Link href={`/track/${parentCode}`} className="font-mono underline font-bold">
                {parentCode}
              </Link>
              . Community report weight has been incremented to accelerate ward intervention!
            </span>
          </div>
        </div>
      )}

      {/* Tracking Code Highlight Card */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-emerald-500/40 shadow-xl mb-6">
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
          Your Grievance Tracking Code
        </span>
        <div className="flex items-center justify-center gap-3 my-2">
          <span className="font-mono text-3xl sm:text-4xl font-extrabold text-emerald-800 dark:text-emerald-300 tracking-wider">
            {code}
          </span>
          <button
            onClick={copyCodeToClipboard}
            className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-100 text-slate-700 dark:text-slate-300 transition-colors"
            title="Copy code"
          >
            {copied ? <Check className="w-5 h-5 text-emerald-600" /> : <Copy className="w-5 h-5" />}
          </button>
        </div>
        <p className="text-xs text-slate-500">
          Save this code to check delivery status or share with neighborhood groups.
        </p>

        {/* Copy Shareable Link */}
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center">
          <button
            onClick={copyLinkToClipboard}
            className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline"
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
          className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-bold text-sm text-white bg-emerald-800 hover:bg-emerald-900 shadow-md active:scale-98 transition-all"
        >
          <Search className="w-4 h-4" />
          <span>Track Grievance Delivery Progress</span>
          <ArrowRight className="w-4 h-4 ml-1" />
        </Link>

        <Link
          href="/report"
          className="w-full inline-flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-semibold text-xs sm:text-sm text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Report Another Issue</span>
        </Link>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="py-20 flex justify-center text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
