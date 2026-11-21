'use client';

import dynamic from 'next/dynamic';
import React from 'react';
import { Loader2 } from 'lucide-react';

interface LocationPickerProps {
  latitude: number;
  longitude: number;
  onLocationChange: (lat: number, lng: number, address?: string) => void;
}

const DynamicLocationPicker = dynamic(() => import('./LocationPickerInner'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-72 sm:h-80 rounded-[24px] bg-[#e6dcce]/40 dark:bg-[#14213d]/60 border border-[#14213d]/15 dark:border-white/15 flex flex-col items-center justify-center text-[#14213d]/60 dark:text-[#f4ede0]/60 gap-2">
      <Loader2 className="w-8 h-8 animate-spin text-[#ff6b5b]" />
      <span className="text-xs font-medium">Loading interactive Coimbatore municipal map...</span>
    </div>
  ),
});

export function LocationPicker(props: LocationPickerProps) {
  return <DynamicLocationPicker {...props} />;
}
