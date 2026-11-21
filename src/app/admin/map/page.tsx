import React from 'react';
import { redirect } from 'next/navigation';
import { getRepository } from '@/lib/db';
import { isAdminAuthenticated } from '@/lib/auth/admin';
import { AdminMapView } from '@/components/map/AdminMapView';
import { AlertTriangle, AlertCircle, Clock, Info } from 'lucide-react';

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
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            City Incident Heatmap & Geospatial Queue
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Geographic distribution of {openIssues.length} active complaints across Coimbatore Corporation wards
          </p>
        </div>

        {/* Priority Pin Legend */}
        <div className="flex items-center gap-3 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-xl shadow-sm">
          <span className="flex items-center gap-1 font-semibold text-red-600">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
            Critical
          </span>
          <span className="flex items-center gap-1 font-semibold text-orange-600">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-600" />
            High
          </span>
          <span className="flex items-center gap-1 font-semibold text-amber-600">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-600" />
            Medium
          </span>
          <span className="flex items-center gap-1 font-semibold text-emerald-600">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
            Low
          </span>
        </div>
      </div>

      <AdminMapView issues={openIssues} />
    </div>
  );
}
