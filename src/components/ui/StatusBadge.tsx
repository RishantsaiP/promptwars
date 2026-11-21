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
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#e0e7ff] text-[#3730a3] border border-[#c7d2fe] dark:bg-[#1e1b4b]/60 dark:text-[#a5b4fc] dark:border-[#4338ca]/80 shadow-sm ${className}`}
        >
          <Send className="w-3.5 h-3.5 text-[#4338ca] dark:text-[#a5b4fc] shrink-0" />
          <span>Reported</span>
        </span>
      );
    case 'In Progress':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#fff7ed] text-[#c2410c] border border-[#ffedd5] dark:bg-[#431407]/60 dark:text-[#fdba74] dark:border-[#9a3412]/80 shadow-sm ${className}`}
        >
          <Wrench className="w-3.5 h-3.5 text-[#ea580c] dark:text-[#fb923c] shrink-0 animate-spin" />
          <span>In Progress</span>
        </span>
      );
    case 'Resolved':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#ecfdf5] text-[#065f46] border border-[#a7f3d0] dark:bg-[#064e3b]/60 dark:text-[#6ee7b7] dark:border-[#047857]/80 shadow-sm ${className}`}
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-[#059669] dark:text-[#34d399] shrink-0" />
          <span>Resolved</span>
        </span>
      );
    default:
      return null;
  }
}
