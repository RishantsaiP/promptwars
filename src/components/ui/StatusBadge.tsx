import React from 'react';
import { Send, Wrench, CheckCircle2 } from 'lucide-react';
import type { Status } from '@/lib/domain/types';

interface StatusBadgeProps {
  status: Status;
  className?: string;
}

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  switch (status) {
    case 'Reported':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-300 dark:bg-blue-950/80 dark:text-blue-300 dark:border-blue-800 ${className}`}
        >
          <Send className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
          <span>Reported</span>
        </span>
      );
    case 'In Progress':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-800 ${className}`}
        >
          <Wrench className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0 animate-pulse" />
          <span>In Progress</span>
        </span>
      );
    case 'Resolved':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-800 ${className}`}
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>Resolved</span>
        </span>
      );
    default:
      return null;
  }
}
