import React from 'react';
import { AlertTriangle, AlertCircle, Clock, Info } from 'lucide-react';
import type { Priority } from '@/lib/domain/types';

interface PriorityBadgeProps {
  priority: Priority;
  urgencyScore?: number;
  className?: string;
  showScore?: boolean;
}

export function PriorityBadge({ priority, urgencyScore, className = '', showScore = false }: PriorityBadgeProps) {
  switch (priority) {
    case 'Critical':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-300 dark:bg-red-950/80 dark:text-red-300 dark:border-red-800 ${className}`}
        >
          <AlertTriangle className="w-3.5 h-3.5 text-red-600 dark:text-red-400 shrink-0" />
          <span>Critical</span>
          {showScore && urgencyScore !== undefined && (
            <span className="text-[10px] bg-red-200 dark:bg-red-900 px-1.5 py-0.2 rounded-full font-mono">
              {urgencyScore}
            </span>
          )}
        </span>
      );
    case 'High':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-800 border border-orange-300 dark:bg-orange-950/80 dark:text-orange-300 dark:border-orange-800 ${className}`}
        >
          <AlertCircle className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400 shrink-0" />
          <span>High</span>
          {showScore && urgencyScore !== undefined && (
            <span className="text-[10px] bg-orange-200 dark:bg-orange-900 px-1.5 py-0.2 rounded-full font-mono">
              {urgencyScore}
            </span>
          )}
        </span>
      );
    case 'Medium':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-800 ${className}`}
        >
          <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
          <span>Medium</span>
          {showScore && urgencyScore !== undefined && (
            <span className="text-[10px] bg-amber-200 dark:bg-amber-900 px-1.5 py-0.2 rounded-full font-mono">
              {urgencyScore}
            </span>
          )}
        </span>
      );
    case 'Low':
    default:
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-800 ${className}`}
        >
          <Info className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>Low</span>
          {showScore && urgencyScore !== undefined && (
            <span className="text-[10px] bg-emerald-200 dark:bg-emerald-900 px-1.5 py-0.2 rounded-full font-mono">
              {urgencyScore}
            </span>
          )}
        </span>
      );
  }
}
