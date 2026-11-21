'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Lock,
  Menu,
  X,
  PlusCircle,
  Search,
  FileText,
  BarChart3,
  Shield,
  ArrowRight,
  MapPin,
  LogIn,
  LogOut,
  User,
} from 'lucide-react';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // Track civilian session
  const [civUser, setCivUser] = useState<{ name: string; email: string } | null>(null);
  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (d?.user) setCivUser(d.user); })
      .catch(() => {});
  }, [pathname]);

  const handleCivLogout = async () => {
    await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'logout' }),
    });
    setCivUser(null);
    router.refresh();
  };

  const navLinks = [
    { href: '/report', label: 'Report', icon: PlusCircle },
    { href: '/track', label: 'Track', icon: Search },
    { href: '/my-reports', label: 'My Reports', icon: FileText },
    { href: '/transparency', label: 'Transparency', icon: BarChart3 },
  ];

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 lg:px-8 py-3 transition-all pointer-events-auto glass-header">
        <div className="max-w-7xl mx-auto flex items-center justify-between pointer-events-auto">
          {/* Logo & Civic Wordmark */}
          <Link href="/" className="flex items-center gap-2.5 group">
            {/* Map-pin shield logo mark in coral + cream */}
            <div className="w-9 h-9 rounded-full bg-[#ff6b5b] flex items-center justify-center shadow-md shadow-[#ff6b5b]/30 group-hover:scale-105 transition-transform">
              <MapPin className="w-5 h-5 text-[#f4ede0]" strokeWidth={2.5} />
            </div>
            <div>
              <div className="flex items-center gap-1.5 leading-none">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight text-[#f4ede0] drop-shadow-sm font-sans">
                  Civic<span className="text-[#ff6b5b]">Resolve</span>
                </span>
              </div>
              <p className="text-[10px] text-[#f4ede0]/55 tracking-wide mt-0.5">
                Coimbatore Municipal Corporation
              </p>
            </div>
          </Link>

          {/* Floating Centered Glass Pill Nav (Desktop) */}
          <nav className="hidden md:flex items-center gap-1 px-3 py-1.5 rounded-full glass-pill text-xs font-semibold shadow-xl border border-white/15">
            {navLinks.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative flex items-center gap-1.5 px-4 py-2 rounded-full transition-all ${
                    isActive
                      ? 'text-white bg-white/10 font-bold shadow-inner'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {/* Active-dot indicator */}
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#ff6b5b] animate-pulse shrink-0" />
                  )}
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right: User / Login + Admin icon */}
          <div className="flex items-center gap-2">

            {/* Civilian session pill */}
            {civUser ? (
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full glass-pill text-xs text-slate-200 border border-white/15">
                <User className="w-3.5 h-3.5 text-[#ff6b5b]" />
                <span className="font-semibold truncate max-w-[100px]">{civUser.name}</span>
                <button
                  onClick={handleCivLogout}
                  title="Sign out"
                  className="ml-1 hover:text-[#ff6b5b] transition-colors"
                  aria-label="Sign out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full glass-pill text-xs font-semibold text-slate-200 hover:text-white border border-white/15 hover:border-[#ff6b5b]/50 transition-all"
              >
                <LogIn className="w-3.5 h-3.5" />
                Sign In
              </Link>
            )}

            {/* Small Admin Portal Icon Button */}
            <Link
              href="/admin"
              className="w-9 h-9 rounded-full glass-pill flex items-center justify-center text-slate-200 hover:text-white hover:border-[#ff6b5b]/50 transition-all hover:scale-105"
              title="Municipal Admin Portal"
              aria-label="Admin Portal"
            >
              <Lock className="w-4 h-4 text-slate-300" />
            </Link>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden w-9 h-9 rounded-full glass-pill flex items-center justify-center text-slate-200 hover:text-white"
              aria-label="Open mobile menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Full-Screen Glass Sheet Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-[#0c1322]/95 backdrop-blur-2xl flex flex-col justify-between p-6 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#ff6b5b]" />
              <span className="font-extrabold text-xl text-white">CivicResolve</span>
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
              aria-label="Close navigation"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <nav className="flex flex-col gap-4 my-auto">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between p-4 rounded-2xl text-xl font-medium transition-all ${
                    isActive
                      ? 'bg-[#ff6b5b] text-[#14213d] font-bold shadow-lg shadow-[#ff6b5b]/25'
                      : 'text-slate-200 bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-6 h-6" />
                    <span>{item.label}</span>
                  </div>
                  <ArrowRight className="w-5 h-5 opacity-60" />
                </Link>
              );
            })}

            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between p-4 rounded-2xl text-base font-semibold text-slate-300 bg-white/5 hover:bg-white/10 mt-2"
            >
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-[#ff6b5b]" />
                <span>Municipal Admin Portal</span>
              </div>
              <ArrowRight className="w-4 h-4 opacity-60" />
            </Link>

            {civUser ? (
              <button
                onClick={() => { handleCivLogout(); setMobileMenuOpen(false); }}
                className="flex items-center gap-3 p-4 rounded-2xl text-base font-semibold text-slate-300 bg-white/5 hover:bg-white/10"
              >
                <LogOut className="w-5 h-5 text-[#ff6b5b]" />
                <span>Sign Out ({civUser.name})</span>
              </button>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between p-4 rounded-2xl text-base font-semibold text-slate-300 bg-white/5 hover:bg-white/10"
              >
                <div className="flex items-center gap-3">
                  <LogIn className="w-5 h-5 text-[#ff6b5b]" />
                  <span>Sign In / Register</span>
                </div>
                <ArrowRight className="w-4 h-4 opacity-60" />
              </Link>
            )}
          </nav>

          <div className="pt-4 border-t border-white/10 text-center text-xs text-slate-400">
            Coimbatore Municipal Corporation • AI-Powered Grievance Platform
          </div>
        </div>
      )}
    </>
  );
}
