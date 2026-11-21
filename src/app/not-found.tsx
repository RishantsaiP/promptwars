import React from 'react';
import Link from 'next/link';
import { Search, Home, PlusCircle } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="py-20 px-4 sm:px-6 lg:px-8 max-w-lg mx-auto w-full text-center">
      <div className="relative overflow-hidden rounded-[32px] atmosphere text-[#f4ede0] p-8 sm:p-12 mb-8 border border-white/15 shadow-2xl">
        <div className="fluted-glass-overlay absolute inset-0 pointer-events-none opacity-30" />

        <div className="relative z-10">
          <div className="w-16 h-16 rounded-full bg-white/10 text-[#ff6b5b] border border-white/15 flex items-center justify-center mx-auto mb-5 shadow-inner">
            <Search className="w-8 h-8" />
          </div>

          <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#ff6b5b] block mb-2">
            Error 404 • Municipal Record Not Found
          </span>

          <h1 className="text-3xl sm:text-4xl font-light text-white tracking-tight mb-3">
            Lost on the <span className="font-normal italic text-[#ff6b5b]">Civic Grid?</span>
          </h1>

          <p className="text-xs sm:text-sm text-white/70 mb-8 max-w-xs mx-auto leading-relaxed">
            The civic page or tracking code you are looking for has moved, expired, or does not exist in the Coimbatore Corporation registry.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/"
              className="btn-coral w-full sm:w-auto inline-flex items-center justify-center gap-2 py-3 px-6 rounded-full font-bold text-xs min-h-[44px] shadow-lg shadow-[#ff6b5b]/20 transition-all"
            >
              <Home className="w-4 h-4" />
              <span>Return Home</span>
            </Link>

            <Link
              href="/report"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-3 px-6 rounded-full font-semibold text-xs min-h-[44px] bg-white/10 hover:bg-white/20 text-white border border-white/15 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Report Grievance</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
