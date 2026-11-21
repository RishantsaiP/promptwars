'use client';

import { useState, useEffect } from 'react';

const DEVICE_ID_KEY = 'civic_resolve_device_id';

export function useDeviceId(): string {
  const [deviceId, setDeviceId] = useState<string>('');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    let stored = localStorage.getItem(DEVICE_ID_KEY);
    if (!stored) {
      stored = 'dev-' + Math.random().toString(36).substring(2, 10) + '-' + Date.now().toString(36);
      localStorage.setItem(DEVICE_ID_KEY, stored);
    }
    setDeviceId(stored);
  }, []);

  return deviceId;
}
