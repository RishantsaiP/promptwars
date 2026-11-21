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
    <div className="w-full h-64 rounded-[20px] bg-[#e6dcce]/40 dark:bg-[#14213d]/60 border border-[#14213d]/15 dark:border-white/15 flex items-center justify-center text-[#14213d]/60 dark:text-[#f4ede0]/60 gap-2">
      <Loader2 className="w-6 h-6 animate-spin text-[#ff6b5b]" />
      <span className="text-xs">Loading incident location map...</span>
    </div>
  ),
});

export function SinglePinMap(props: SinglePinMapProps) {
  return <DynamicSinglePinMap {...props} />;
}
