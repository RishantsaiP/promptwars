import React from 'react';
import Link from 'next/link';
import { Phone, ShieldAlert, MapPin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-[#0c1322] text-slate-400 text-xs border-t border-white/10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand & Municipal Note */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#ff6b5b]" />
              <span className="font-extrabold text-base text-white font-sans tracking-tight">
                CivicResolve
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-slate-300 border border-white/10 font-mono">
                Coimbatore
              </span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed max-w-md">
              AI-assisted municipal grievance redressal and departmental triage platform.
              Citizens report road damages, waste accumulation, street light faults, and water leakage.
              Powered by Google Gemini multimodal intelligence with human supervisory oversight.
            </p>
          </div>

          {/* Quick Helpline Numbers */}
          <div>
            <h4 className="text-[11px] uppercase tracking-wider text-slate-200 font-bold mb-3 flex items-center gap-1.5 font-mono">
              <Phone className="w-3.5 h-3.5 text-[#ff6b5b]" />
              Municipal Helplines
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-400 font-mono">
              <li>
                <span className="font-semibold text-slate-200">1913</span> — Corporation Toll-Free
              </li>
              <li>
                <span className="font-semibold text-slate-200">100 / 112</span> — Police Control
              </li>
              <li>
                <span className="font-semibold text-slate-200">101</span> — Fire & Rescue
              </li>
              <li>
                <span className="font-semibold text-slate-200">108</span> — Medical Emergency
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-[11px] uppercase tracking-wider text-slate-200 font-bold mb-3 flex items-center gap-1.5 font-mono">
              <ShieldAlert className="w-3.5 h-3.5 text-[#ff6b5b]" />
              Quick Navigation
            </h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <Link href="/report" className="hover:text-white transition-colors">
                  File a Grievance
                </Link>
              </li>
              <li>
                <Link href="/track" className="hover:text-white transition-colors">
                  Delivery Stepper Tracking
                </Link>
              </li>
              <li>
                <Link href="/transparency" className="hover:text-white transition-colors">
                  Department SLAs & Metrics
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-white transition-colors">
                  Municipal Officers Console
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-3">
          <p>© 2026 Coimbatore Municipal Corporation. Built for Civic Impact.</p>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1 font-mono text-slate-400">
              <MapPin className="w-3 h-3 text-[#ff6b5b]" />
              11.0147° N, 76.9557° E
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
