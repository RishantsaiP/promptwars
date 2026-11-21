'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  ListOrdered,
  Map,
  RotateCcw,
  LogOut,
  Shield,
  Loader2,
  Check,
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [resetting, setResetting] = useState(false);
  const [resetDone, setResetDone] = useState(false);

  // If on login page, render plain without admin nav bar
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  const navItems = [
    { href: '/admin', label: 'Overview', icon: LayoutDashboard },
    { href: '/admin/issues', label: 'Priority Queue', icon: ListOrdered },
    { href: '/admin/map', label: 'City Map View', icon: Map },
  ];

  const handleResetDemoData = async () => {
    if (!confirm('Reset all issues back to original 25 Coimbatore seed complaints?')) {
      return;
    }

    try {
      setResetting(true);
      const res = await fetch('/api/seed', { method: 'POST' });
      if (res.ok) {
        setResetDone(true);
        setTimeout(() => setResetDone(false), 2500);
        router.refresh();
      }
    } catch (err) {
      console.error('Reset failed:', err);
    } finally {
      setResetting(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'logout' }),
      });
      router.push('/admin/login');
      router.refresh();
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-100/60 dark:bg-slate-950">
      {/* Admin Subheader Bar */}
      <div className="bg-slate-900 text-white border-b border-slate-800 px-4 sm:px-6 lg:px-8 py-2.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Corporation Admin Console
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    isActive
                      ? 'bg-emerald-800 text-white'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Actions: Demo Reset & Logout */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleResetDemoData}
              disabled={resetting}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 transition-colors"
              title="Reset demo data"
            >
              {resetting ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : resetDone ? (
                <Check className="w-3 h-3 text-emerald-400" />
              ) : (
                <RotateCcw className="w-3 h-3" />
              )}
              <span>{resetDone ? 'Reset Done' : 'Reset Demo Data'}</span>
            </button>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-red-900/60 text-slate-300 hover:text-red-200 border border-slate-700 transition-colors"
              title="Sign out"
            >
              <LogOut className="w-3 h-3" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8">{children}</div>
    </div>
  );
}
