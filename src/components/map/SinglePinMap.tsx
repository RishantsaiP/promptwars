'use client';

import dynamic from 'next/dynamic';
import React from 'react';
import { Loader2 } from 'lucide-react';

interface SinglePinMapProps {
  latitude: number;
  longitude: number;
  title: string;
  address: string;
}

const DynamicSinglePinMap = dynamic(() => import('./SinglePinMapInner'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-64 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 gap-2">
      <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
      <span className="text-xs">Loading incident location map...</span>
    </div>
  ),
});

export function SinglePinMap(props: SinglePinMapProps) {
  return <DynamicSinglePinMap {...props} />;
}
