import React from 'react';
import { redirect } from 'next/navigation';
import { getRepository } from '@/lib/db';
import { isAdminAuthenticated } from '@/lib/auth/admin';
import { AdminMapView } from '@/components/map/AdminMapView';

export const dynamic = 'force-dynamic';

export default async function AdminMapPage() {
  const isAuth = await isAdminAuthenticated();
  if (!isAuth) {
    redirect('/admin/login');
  }

  const repo = getRepository();
  const { issues } = repo.list({ limit: 100 });
  const openIssues = issues.filter((i) => i.status !== 'Resolved');

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ff6b5b]/10 text-[#14213d] dark:text-[#f4ede0] border border-[#ff6b5b]/20 text-[11px] font-semibold tracking-wide uppercase mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ff6b5b]" />
            Geospatial Ward Dispatch
          </div>
          <h1 className="text-2xl sm:text-3xl font-light text-[#14213d] dark:text-[#f4ede0] tracking-tight">
            City Incident Map & <span className="font-normal italic text-[#ff6b5b]">Geospatial Queue</span>
          </h1>
          <p className="text-xs text-[#14213d]/60 dark:text-[#f4ede0]/60 mt-0.5">
            Geographic distribution of {openIssues.length} active complaints across Coimbatore Corporation wards
          </p>
        </div>

        {/* Priority Pin Legend with semantic tokens */}
        <div className="flex items-center gap-3 text-xs bg-white dark:bg-[#14213d] border border-[#14213d]/15 dark:border-white/15 px-4 py-2 rounded-full shadow-sm">
          <span className="flex items-center gap-1.5 font-semibold text-[#991b1b] dark:text-[#fca5a5]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#991b1b] ring-1 ring-[#14213d]" />
            Critical
          </span>
          <span className="flex items-center gap-1.5 font-semibold text-[#9a3412] dark:text-[#fdba74]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#9a3412] ring-1 ring-[#14213d]" />
            High
          </span>
          <span className="flex items-center gap-1.5 font-semibold text-[#854d0e] dark:text-[#fde047]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#854d0e] ring-1 ring-[#14213d]" />
            Medium
          </span>
          <span className="flex items-center gap-1.5 font-semibold text-[#166534] dark:text-[#86efac]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#166534] ring-1 ring-[#14213d]" />
            Low
          </span>
        </div>
      </div>

      <AdminMapView issues={openIssues} />
    </div>
  );
}
