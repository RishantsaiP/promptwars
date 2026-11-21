'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ShieldCheck,
  PlusCircle,
  Search,
  FileText,
  BarChart3,
  Lock,
  Menu,
  X,
  MapPin,
} from 'lucide-react';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { href: '/report', label: 'Report Issue', icon: PlusCircle, primary: true },
    { href: '/track', label: 'Track Status', icon: Search },
    { href: '/my-reports', label: 'My Reports', icon: FileText },
    { href: '/transparency', label: 'Transparency', icon: BarChart3 },
    { href: '/admin', label: 'Admin Portal', icon: Lock },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & City Badge */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-800 to-teal-600 flex items-center justify-center text-white shadow-md shadow-emerald-900/20 group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white">
                  Civic<span className="text-emerald-700 dark:text-emerald-400">Resolve</span>
                </span>
                <span className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] uppercase font-bold tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 rounded border border-emerald-300 dark:border-emerald-700">
                  AI Triage
                </span>
              </div>
              <p className="text-[11px] text-slate-700 dark:text-slate-300 flex items-center gap-0.5">
                <MapPin className="w-3 h-3 text-emerald-600" />
                Coimbatore Municipal Corporation
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));

              if (item.primary) {
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="ml-2 inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm text-white bg-emerald-800 hover:bg-emerald-900 shadow-sm transition-all active:scale-95"
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-800 dark:bg-slate-800 dark:text-emerald-400'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4 opacity-70" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-2 pb-4 space-y-1">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-base font-medium ${
                  item.primary
                    ? 'bg-emerald-800 text-white font-semibold'
                    : isActive
                    ? 'bg-emerald-50 text-emerald-800 dark:bg-slate-800 dark:text-emerald-400'
                    : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-5 h-5 opacity-80" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
