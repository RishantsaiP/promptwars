import React from 'react';
import { AlertTriangle, AlertCircle, Clock, CheckCircle2 } from 'lucide-react';
import type { Priority } from '@/lib/domain/types';

interface PriorityBadgeProps {
  priority: Priority;
  urgencyScore?: number;
  className?: string;
  showScore?: boolean;
}

export function PriorityBadge({
  priority,
  urgencyScore,
  className = '',
  showScore = false,
}: PriorityBadgeProps) {
  switch (priority) {
    case 'Critical':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#fee2e2] text-[#991b1b] border border-[#fca5a5] dark:bg-[#7f1d1d]/40 dark:text-[#f87171] dark:border-[#991b1b]/80 shadow-sm badge-glow ${className}`}
        >
          <AlertTriangle className="w-3.5 h-3.5 text-[#991b1b] dark:text-[#f87171] shrink-0" />
          <span>Critical</span>
          {showScore && urgencyScore !== undefined && (
            <span className="text-[10px] bg-[#fca5a5]/50 dark:bg-[#991b1b] px-1.5 py-0.2 rounded-full font-mono ml-0.5">
              {urgencyScore}
            </span>
          )}
        </span>
      );
    case 'High':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#ffedd5] text-[#9a3412] border border-[#fdba74] dark:bg-[#7c2d12]/40 dark:text-[#fb923c] dark:border-[#9a3412]/80 shadow-sm ${className}`}
        >
          <AlertCircle className="w-3.5 h-3.5 text-[#9a3412] dark:text-[#fb923c] shrink-0" />
          <span>High</span>
          {showScore && urgencyScore !== undefined && (
            <span className="text-[10px] bg-[#fdba74]/50 dark:bg-[#9a3412] px-1.5 py-0.2 rounded-full font-mono ml-0.5">
              {urgencyScore}
            </span>
          )}
        </span>
      );
    case 'Medium':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#fef9c3] text-[#854d0e] border border-[#fde047] dark:bg-[#713f12]/40 dark:text-[#fde047] dark:border-[#854d0e]/80 shadow-sm ${className}`}
        >
          <Clock className="w-3.5 h-3.5 text-[#854d0e] dark:text-[#fde047] shrink-0" />
          <span>Medium</span>
          {showScore && urgencyScore !== undefined && (
            <span className="text-[10px] bg-[#fde047]/50 dark:bg-[#854d0e] px-1.5 py-0.2 rounded-full font-mono ml-0.5">
              {urgencyScore}
            </span>
          )}
        </span>
      );
    case 'Low':
    default:
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#dcfce7] text-[#166534] border border-[#86efac] dark:bg-[#14532d]/40 dark:text-[#86efac] dark:border-[#166534]/80 shadow-sm ${className}`}
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-[#166534] dark:text-[#86efac] shrink-0" />
          <span>Low</span>
          {showScore && urgencyScore !== undefined && (
            <span className="text-[10px] bg-[#86efac]/50 dark:bg-[#166534] px-1.5 py-0.2 rounded-full font-mono ml-0.5">
              {urgencyScore}
            </span>
          )}
        </span>
      );
  }
}
