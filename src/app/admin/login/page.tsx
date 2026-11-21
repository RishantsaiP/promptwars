'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, ShieldCheck, ArrowRight, AlertCircle, Loader2, Sparkles } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (pwToUse?: string) => {
    const pw = pwToUse || password;
    if (!pw) {
      setError('Please enter the administrative password.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pw }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      router.push('/admin');
      router.refresh();
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Login failed';
      setError(errorMsg);
      setLoading(false);
    }
  };

  const handleDemoAdmin = () => {
    setPassword('coimbatore2026');
    handleLogin('coimbatore2026');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl">
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center justify-center mx-auto mb-4 shadow-sm">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Municipal Admin Portal
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Coimbatore Corporation Supervisory Dashboard
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-300 dark:border-red-800 text-red-800 dark:text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleLogin();
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-1.5">
              Admin Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter administrator password..."
              className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-bold text-sm text-white bg-emerald-800 hover:bg-emerald-900 shadow-md active:scale-98 transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
            <span>Sign In to Admin Console</span>
          </button>
        </form>

        {/* 1-Click Demo Mode Button */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={handleDemoAdmin}
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-semibold text-xs text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 border border-emerald-300 dark:border-emerald-800 transition-colors"
          >
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>Use Demo Admin (1-Click Login)</span>
          </button>
          <p className="text-[10px] text-slate-400 text-center mt-2">
            Preset credentials for hackathon evaluation: <span className="font-mono">coimbatore2026</span>
          </p>
        </div>
      </div>
    </div>
  );
}
