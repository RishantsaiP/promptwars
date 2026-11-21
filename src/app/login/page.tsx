'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  Lock,
  ShieldCheck,
  User,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  Sparkles,
  ArrowRight,
  UserCheck,
} from 'lucide-react';

type Tab = 'civilian' | 'admin';
type CivilianMode = 'login' | 'register';

// ─── small reusable input ────────────────────────────────────────────────────
function Field({
  label,
  type,
  value,
  onChange,
  placeholder,
  required,
  autoComplete,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  autoComplete?: string;
}) {
  const [show, setShow] = useState(false);
  const isPassword = type === 'password';
  return (
    <div>
      <label className="block text-xs font-bold text-[#14213d]/70 dark:text-[#f4ede0]/70 uppercase tracking-wider mb-1.5">
        {label}
      </label>
      <div className="relative">
        <input
          type={isPassword && show ? 'text' : type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
          className="w-full min-h-[48px] px-4 pr-10 rounded-full border border-[#14213d]/15 dark:border-white/15 bg-white dark:bg-black/30 text-[#14213d] dark:text-[#f4ede0] text-sm outline-none focus:ring-2 focus:ring-[#ff6b5b] transition"
        />
        {isPassword && (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShow((s) => !s)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#14213d]/40 dark:text-[#f4ede0]/40 hover:text-[#ff6b5b] transition"
            aria-label={show ? 'Hide password' : 'Show password'}
          >
            {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Error banner ────────────────────────────────────────────────────────────
function ErrorBanner({ msg }: { msg: string }) {
  return (
    <div className="p-3.5 rounded-2xl bg-[#991b1b]/10 border border-[#991b1b]/30 text-[#991b1b] dark:text-[#fca5a5] text-xs flex items-start gap-2">
      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
      <span>{msg}</span>
    </div>
  );
}

// ─── Success banner ──────────────────────────────────────────────────────────
function SuccessBanner({ msg }: { msg: string }) {
  return (
    <div className="p-3.5 rounded-2xl bg-green-500/10 border border-green-500/30 text-green-700 dark:text-green-300 text-xs flex items-start gap-2">
      <UserCheck className="w-4 h-4 shrink-0 mt-0.5" />
      <span>{msg}</span>
    </div>
  );
}

// ─── Civilian panel ──────────────────────────────────────────────────────────
function CivilianPanel() {
  const router = useRouter();
  const [mode, setMode] = useState<CivilianMode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const reset = () => {
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    reset();

    if (mode === 'register' && password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (mode === 'register' && password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    startTransition(async () => {
      try {
        const url = mode === 'register' ? '/api/auth/register' : '/api/auth/login';
        const body =
          mode === 'register'
            ? { name, email, password }
            : { email, password };

        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || 'Something went wrong.');
          return;
        }
        if (mode === 'register') {
          setSuccess(`Welcome, ${data.user.name}! Account created. Redirecting…`);
          setTimeout(() => router.push('/'), 1500);
        } else {
          router.push('/');
          router.refresh();
        }
      } catch {
        setError('Network error. Please try again.');
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Mode toggle */}
      <div className="flex gap-1 p-1 rounded-full bg-[#e6dcce]/50 dark:bg-white/10">
        {(['login', 'register'] as CivilianMode[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => { setMode(m); reset(); }}
            className={`flex-1 py-2 rounded-full text-xs font-semibold transition-all ${
              mode === m
                ? 'bg-white dark:bg-[#14213d] text-[#ff6b5b] shadow'
                : 'text-[#14213d]/60 dark:text-[#f4ede0]/60 hover:text-[#ff6b5b]'
            }`}
          >
            {m === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        ))}
      </div>

      {error && <ErrorBanner msg={error} />}
      {success && <SuccessBanner msg={success} />}

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === 'register' && (
          <Field label="Full Name" type="text" value={name} onChange={setName} placeholder="Your name" required autoComplete="name" />
        )}
        <Field label="Email Address" type="email" value={email} onChange={setEmail} placeholder="you@example.com" required autoComplete="email" />
        <Field label="Password" type="password" value={password} onChange={setPassword} placeholder={mode === 'register' ? 'Min 8 characters' : 'Your password'} required autoComplete={mode === 'register' ? 'new-password' : 'current-password'} />
        {mode === 'register' && (
          <Field label="Confirm Password" type="password" value={confirm} onChange={setConfirm} placeholder="Repeat password" required autoComplete="new-password" />
        )}

        <button
          type="submit"
          disabled={isPending}
          className="btn-coral w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-full font-bold text-sm min-h-[48px] shadow-lg shadow-[#ff6b5b]/20 active:scale-[0.98] transition-all disabled:opacity-50"
        >
          {isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : mode === 'login' ? (
            <ArrowRight className="w-4 h-4" />
          ) : (
            <UserCheck className="w-4 h-4" />
          )}
          <span>{mode === 'login' ? 'Sign In' : 'Create Account'}</span>
        </button>
      </form>
    </div>
  );
}

// ─── Admin panel ─────────────────────────────────────────────────────────────
function AdminPanel() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleLogin = (pw?: string) => {
    const p = pw ?? password;
    if (!p) { setError('Please enter the administrator password.'); return; }
    setError(null);

    startTransition(async () => {
      try {
        const res = await fetch('/api/admin/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password: p }),
        });
        const data = await res.json();
        if (!res.ok) { setError(data.error || 'Authentication failed.'); return; }
        router.push('/admin');
        router.refresh();
      } catch {
        setError('Network error. Please try again.');
      }
    });
  };

  return (
    <div className="space-y-6">
      {error && <ErrorBanner msg={error} />}

      <form
        onSubmit={(e) => { e.preventDefault(); handleLogin(); }}
        className="space-y-4"
      >
        <Field
          label="Admin Password"
          type="password"
          value={password}
          onChange={setPassword}
          placeholder="Enter administrator password…"
          required
          autoComplete="current-password"
        />
        <button
          type="submit"
          disabled={isPending}
          className="btn-coral w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-full font-bold text-sm min-h-[48px] shadow-lg shadow-[#ff6b5b]/20 active:scale-[0.98] transition-all disabled:opacity-50"
        >
          {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
          <span>Sign In to Admin Console</span>
        </button>
      </form>

      <div className="pt-2 border-t border-[#14213d]/10 dark:border-white/10 text-center space-y-2">
        <button
          type="button"
          onClick={() => { setPassword('coimbatore2026'); handleLogin('coimbatore2026'); }}
          disabled={isPending}
          className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-full font-semibold text-xs text-[#14213d] dark:text-[#f4ede0] bg-[#e6dcce]/60 hover:bg-[#e6dcce] dark:bg-white/10 dark:hover:bg-white/20 border border-[#14213d]/15 dark:border-white/15 transition-all"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#ff6b5b]" />
          <span>Use Demo Admin (1-Click)</span>
        </button>
        <p className="text-[10px] text-[#14213d]/40 dark:text-[#f4ede0]/40 font-mono">
          Hackathon demo — password: coimbatore2026
        </p>
      </div>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────
export default function LoginPage() {
  const [tab, setTab] = useState<Tab>('civilian');

  const tabs: { id: Tab; label: string; Icon: React.FC<React.SVGProps<SVGSVGElement>> }[] = [
    { id: 'civilian', label: 'Citizen', Icon: User },
    { id: 'admin', label: 'Admin', Icon: Lock },
  ];

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 p-8 sm:p-10 rounded-[32px] bg-[#fcf9f4] dark:bg-[#14213d] border border-[#14213d]/15 dark:border-white/15 shadow-2xl animate-fade-in-up">

        {/* Header */}
        <div className="text-center space-y-1">
          <h1 className="text-2xl sm:text-3xl font-light text-[#14213d] dark:text-[#f4ede0] tracking-tight">
            Welcome to <span className="font-semibold italic text-[#ff6b5b]">CivicResolve</span>
          </h1>
          <p className="text-xs text-[#14213d]/55 dark:text-[#f4ede0]/55">
            Coimbatore Municipal Corporation · AI-Powered Grievance Portal
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex gap-1 p-1 rounded-full bg-[#e6dcce]/50 dark:bg-white/10">
          {tabs.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-full text-xs font-semibold transition-all ${
                tab === id
                  ? 'bg-white dark:bg-black/40 text-[#ff6b5b] shadow'
                  : 'text-[#14213d]/60 dark:text-[#f4ede0]/60 hover:text-[#ff6b5b]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>

        {/* Panel */}
        <div>
          {tab === 'civilian' ? <CivilianPanel /> : <AdminPanel />}
        </div>

        {/* Footer note */}
        <p className="text-center text-[10px] text-[#14213d]/40 dark:text-[#f4ede0]/40">
          Your session is protected with an httpOnly cookie & HS256 JWT.
          Passwords are hashed with bcrypt (12 rounds).
        </p>
      </div>
    </div>
  );
}
