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
    <div className="flex-1 flex flex-col bg-[#0c1322] text-[#f4ede0] min-h-screen">
      {/* Sticky Admin Subheader Bar */}
      <div className="sticky top-0 z-40 bg-[#0c1322] text-[#f4ede0] border-b border-white/10 px-4 sm:px-6 lg:px-8 py-3 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-[#ff6b5b]/20 flex items-center justify-center border border-[#ff6b5b]/30">
              <Shield className="w-3.5 h-3.5 text-[#ff6b5b]" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#f4ede0]">
              Corporation Admin Console
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="flex items-center gap-1.5 bg-[#14213d]/5 p-1 rounded-full border border-white/10">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-[#ff6b5b] text-[#14213d] font-bold shadow-sm'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
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
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-white/10 hover:bg-white/20 text-[#f4ede0] border border-white/15 transition-all"
              title="Reset demo data"
            >
              {resetting ? (
                <Loader2 className="w-3 h-3 animate-spin text-[#ff6b5b]" />
              ) : resetDone ? (
                <Check className="w-3 h-3 text-emerald-400" />
              ) : (
                <RotateCcw className="w-3 h-3 text-[#ff6b5b]" />
              )}
              <span>{resetDone ? 'Reset Done' : 'Reset Demo Data'}</span>
            </button>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-white/10 hover:bg-[#991b1b] text-[#f4ede0] border border-white/15 transition-all"
              title="Sign out"
            >
              <LogOut className="w-3 h-3" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-7xl mx-auto w-full pt-20 p-4 sm:p-6 lg:p-8">{children}</div>
    </div>
  );
}
