'use client';

import dynamic from 'next/dynamic';
import React from 'react';
import { Loader2 } from 'lucide-react';
import type { Issue } from '@/lib/domain/types';

interface AdminMapViewProps {
  issues: Issue[];
}

const DynamicAdminMap = dynamic(() => import('./AdminMapInner'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[650px] rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center text-slate-400 gap-2">
      <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      <span className="text-sm font-medium">Rendering city incident pins on Coimbatore grid...</span>
    </div>
  ),
});

export function AdminMapView(props: AdminMapViewProps) {
  return <DynamicAdminMap {...props} />;
}
