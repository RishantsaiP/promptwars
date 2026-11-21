import React from 'react';
import Link from 'next/link';
import { Phone, ShieldAlert, Heart, ExternalLink } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 text-sm border-t border-slate-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand & Municipal Note */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <span className="font-extrabold text-lg text-white">CivicResolve</span>
              <span className="text-xs px-2 py-0.5 rounded bg-emerald-900/80 text-emerald-300 border border-emerald-700">
                Coimbatore
              </span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed max-w-md">
              AI-assisted civic grievance redressal and municipal triage platform.
              Citizens report road damages, waste accumulation, street light faults, and water leakage.
              Powered by Google Gemini multimodal intelligence with human supervisory oversight.
            </p>
          </div>

          {/* Quick Helpline Numbers */}
          <div>
            <h4 className="text-xs uppercase tracking-wider text-slate-200 font-bold mb-3 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              Emergency Helplines
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li>
                <span className="font-semibold text-slate-300">1913</span> — Corporation Toll-Free
              </li>
              <li>
                <span className="font-semibold text-slate-300">100 / 112</span> — Police Control
              </li>
              <li>
                <span className="font-semibold text-slate-300">101</span> — Fire & Rescue
              </li>
              <li>
                <span className="font-semibold text-slate-300">108</span> — Ambulance Emergency
              </li>
            </ul>
          </div>

          {/* Navigation & Governance */}
          <div>
            <h4 className="text-xs uppercase tracking-wider text-slate-200 font-bold mb-3 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              Platform
            </h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <Link href="/report" className="hover:text-emerald-400 transition-colors">
                  File a Grievance
                </Link>
              </li>
              <li>
                <Link href="/track" className="hover:text-emerald-400 transition-colors">
                  Track Delivery Progress
                </Link>
              </li>
              <li>
                <Link href="/transparency" className="hover:text-emerald-400 transition-colors">
                  Department SLAs & Metrics
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-emerald-400 transition-colors">
                  Municipal Officers Login
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-300 gap-3">
          <p>© 2026 Coimbatore Municipal Corporation. Built for Hackathon Prototype.</p>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1 text-slate-300">
              Center: 11.0147° N, 76.9557° E
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
