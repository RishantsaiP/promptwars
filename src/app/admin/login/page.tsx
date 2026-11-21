'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, ShieldCheck, AlertCircle, Loader2, Sparkles } from 'lucide-react';

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
      <div className="max-w-md w-full space-y-8 p-8 sm:p-10 rounded-[32px] bg-[#fcf9f4] dark:bg-[#14213d] border border-[#14213d]/15 dark:border-white/15 shadow-2xl relative">
        <div className="text-center">
          <div className="w-14 h-14 rounded-full bg-[#ff6b5b]/20 text-[#ff6b5b] flex items-center justify-center mx-auto mb-4 shadow-sm border border-[#ff6b5b]/30">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-light text-[#14213d] dark:text-[#f4ede0] tracking-tight">
            Municipal <span className="font-normal italic text-[#ff6b5b]">Admin Portal</span>
          </h2>
          <p className="text-xs text-[#14213d]/60 dark:text-[#f4ede0]/60 mt-1">
            Coimbatore Corporation Supervisory Dashboard
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-full bg-[#991b1b]/10 border border-[#991b1b]/30 text-[#991b1b] dark:text-[#fca5a5] text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-[#991b1b]" />
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
            <label className="block text-xs font-bold text-[#14213d]/70 dark:text-[#f4ede0]/70 uppercase tracking-wider mb-2">
              Admin Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter administrator password..."
              className="w-full min-h-[48px] px-4 rounded-full border border-[#14213d]/15 dark:border-white/15 bg-white dark:bg-black/30 text-[#14213d] dark:text-[#f4ede0] text-sm outline-none focus:ring-2 focus:ring-[#ff6b5b]"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-coral w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-full font-bold text-sm min-h-[48px] shadow-lg shadow-[#ff6b5b]/20 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
            <span>Sign In to Admin Console</span>
          </button>
        </form>

        {/* 1-Click Demo Mode Button */}
        <div className="pt-4 border-t border-[#14213d]/10 dark:border-white/10 text-center">
          <button
            type="button"
            onClick={handleDemoAdmin}
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-full font-semibold text-xs text-[#14213d] dark:text-[#f4ede0] bg-[#e6dcce]/60 hover:bg-[#e6dcce] dark:bg-white/10 dark:hover:bg-white/20 border border-[#14213d]/15 dark:border-white/15 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#ff6b5b]" />
            <span>Use Demo Admin (1-Click Login)</span>
          </button>
          <p className="text-[10px] text-[#14213d]/50 dark:text-[#f4ede0]/50 text-center mt-2 font-mono">
            Preset credentials for hackathon evaluation: coimbatore2026
          </p>
        </div>
      </div>
    </div>
  );
}
