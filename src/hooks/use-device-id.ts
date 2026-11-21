'use client';

import { useSyncExternalStore } from 'react';

const DEVICE_ID_KEY = 'civic_resolve_device_id';

function subscribe(callback: () => void) {
  window.addEventListener('storage', callback);
  return () => window.removeEventListener('storage', callback);
}

function getSnapshot() {
  if (typeof window === 'undefined') return '';
  let stored = localStorage.getItem(DEVICE_ID_KEY);
  if (!stored) {
    stored = 'dev-' + Math.random().toString(36).substring(2, 10) + '-' + Date.now().toString(36);
    localStorage.setItem(DEVICE_ID_KEY, stored);
  }
  return stored;
}

function getServerSnapshot() {
  return '';
}

export function useDeviceId(): string {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
