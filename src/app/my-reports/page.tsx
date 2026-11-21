'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { FileText, PlusCircle, Clock, MapPin, ArrowRight, Loader2, Inbox } from 'lucide-react';
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
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            My Reported Grievances
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Anonymous device-linked list of complaints submitted from this browser.
          </p>
        </div>

        <Link
          href="/report"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-900 shadow-sm transition-all shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>File New Grievance</span>
        </Link>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          <span className="text-xs">Loading your complaints...</span>
        </div>
      ) : issues.length === 0 ? (
        <div className="py-16 px-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center max-w-md mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-4">
            <Inbox className="w-7 h-7" />
          </div>
          <h3 className="font-bold text-base text-slate-900 dark:text-white mb-1">
            No complaints logged yet
          </h3>
          <p className="text-xs text-slate-500 mb-6 leading-relaxed">
            You haven&apos;t filed any civic grievances from this device yet. When you report potholes, broken lights, or water leakage, they will appear here.
          </p>
          <Link
            href="/report"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-emerald-800 hover:bg-emerald-900 shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Report First Issue</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {issues.map((issue) => (
            <div
              key={issue.id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-emerald-500/50 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="font-mono text-xs font-bold text-slate-500">
                    {issue.tracking_code}
                  </span>
                  <PriorityBadge priority={issue.final_priority} />
                  <StatusBadge status={issue.status} />
                </div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1">
                  {issue.title}
                </h3>
                <p className="text-xs text-slate-500 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
                  <span className="truncate max-w-md">{issue.address}</span>
                </p>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-0 pt-3 sm:pt-0 border-slate-100 dark:border-slate-800">
                <span className="text-[11px] text-slate-400">
                  {new Date(issue.created_at).toLocaleDateString('en-IN', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
                <Link
                  href={`/track/${issue.tracking_code}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 transition-colors"
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
