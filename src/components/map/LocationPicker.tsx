'use client';

import dynamic from 'next/dynamic';
import React from 'react';
import { MapPin, Loader2 } from 'lucide-react';

interface LocationPickerProps {
  latitude: number;
  longitude: number;
  onLocationChange: (lat: number, lng: number, address?: string) => void;
}

const DynamicLocationPicker = dynamic(() => import('./LocationPickerInner'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-72 sm:h-80 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center text-slate-400 gap-2">
      <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      <span className="text-xs font-medium">Loading interactive Coimbatore municipal map...</span>
    </div>
  ),
});

export function LocationPicker(props: LocationPickerProps) {
  return <DynamicLocationPicker {...props} />;
}
