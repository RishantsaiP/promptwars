'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { PlusCircle, MapPin, ArrowRight, Loader2, Inbox } from 'lucide-react';
import { useDeviceId } from '@/hooks/use-device-id';
import type { Issue } from '@/lib/domain/types';
import { PriorityBadge } from '@/components/ui/PriorityBadge';
import { StatusBadge } from '@/components/ui/StatusBadge';

export default function MyReportsPage() {
  const deviceId = useDeviceId();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!deviceId) return;

    const fetchMyIssues = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/issues/device/${deviceId}`);
        if (res.ok) {
          const data = await res.json();
          setIssues(data.issues || []);
        }
      } catch (err) {
        console.error('Failed to load my reports:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMyIssues();
  }, [deviceId]);

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full animate-fade-in-up">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ff6b5b]/10 text-[#14213d] dark:text-[#f4ede0] border border-[#ff6b5b]/20 text-[11px] font-semibold tracking-wide uppercase mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ff6b5b]" />
            Citizen Grievance Ledger
          </div>
          <h1 className="text-3xl sm:text-4xl font-light text-[#14213d] dark:text-[#f4ede0] tracking-tight">
            My Reported <span className="font-normal italic text-[#ff6b5b]">Grievances</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#14213d]/60 dark:text-[#f4ede0]/60 mt-1">
            Anonymous device-linked list of complaints submitted from this browser.
          </p>
        </div>

        <Link
          href="/report"
          className="btn-coral inline-flex items-center gap-2 px-5 py-3 rounded-full text-xs font-bold shrink-0 shadow-md shadow-[#ff6b5b]/20 active:scale-[0.98] transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>File New Grievance</span>
        </Link>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-[#ff6b5b] gap-3">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span className="text-xs font-medium text-[#14213d]/60 dark:text-[#f4ede0]/60">Loading your complaints...</span>
        </div>
      ) : issues.length === 0 ? (
        <div className="py-16 px-6 rounded-[32px] bg-[#fcf9f4] dark:bg-white/[0.04] border border-[#14213d]/10 dark:border-white/10 text-center max-w-md mx-auto shadow-sm">
          <div className="w-14 h-14 rounded-full bg-[#e6dcce] dark:bg-white/10 text-[#14213d] dark:text-[#f4ede0] flex items-center justify-center mx-auto mb-4">
            <Inbox className="w-7 h-7" />
          </div>
          <h3 className="font-semibold text-lg text-[#14213d] dark:text-[#f4ede0] mb-1">
            No complaints logged yet
          </h3>
          <p className="text-xs text-[#14213d]/60 dark:text-[#f4ede0]/60 mb-6 leading-relaxed">
            You haven&apos;t filed any civic grievances from this device yet. When you report potholes, broken lights, or water leakage, they will appear here.
          </p>
          <Link
            href="/report"
            className="btn-coral inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold text-xs shadow-md shadow-[#ff6b5b]/20"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Report First Issue</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-3.5">
          {issues.map((issue) => (
            <div
              key={issue.id}
              className="p-5 sm:p-6 rounded-[24px] bg-[#fcf9f4] dark:bg-white/[0.04] border border-[#14213d]/10 dark:border-white/10 shadow-sm card-hover-lift flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="font-mono text-xs font-bold text-[#14213d]/70 dark:text-[#f4ede0]/70">
                    {issue.tracking_code}
                  </span>
                  <PriorityBadge priority={issue.final_priority} />
                  <StatusBadge status={issue.status} />
                </div>
                <h3 className="font-semibold text-base text-[#14213d] dark:text-[#f4ede0] mb-1">
                  {issue.title}
                </h3>
                <p className="text-xs text-[#14213d]/60 dark:text-[#f4ede0]/60 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#ff6b5b] shrink-0" />
                  <span className="truncate max-w-md">{issue.address}</span>
                </p>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-0 pt-3 sm:pt-0 border-[#14213d]/10 dark:border-white/10">
                <span className="text-xs text-[#14213d]/50 dark:text-[#f4ede0]/50 font-mono">
                  {new Date(issue.created_at).toLocaleDateString('en-IN', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
                <Link
                  href={`/track/${issue.tracking_code}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold text-[#14213d] dark:text-[#f4ede0] bg-[#e6dcce]/60 hover:bg-[#ff6b5b] hover:text-[#14213d] dark:bg-white/10 dark:hover:bg-[#ff6b5b] dark:hover:text-[#14213d] transition-all"
                >
                  <span>Track</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
