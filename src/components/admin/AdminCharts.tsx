'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts';
import type { DashboardStats } from '@/lib/domain/types';

const STATUS_COLORS: Record<string, string> = {
  Reported: '#3b82f6',
  'In Progress': '#f59e0b',
  Resolved: '#10b981',
};

export function AdminCharts({ stats }: { stats: DashboardStats }) {
  // Format department data
  const deptData = Object.entries(stats.by_department).map(([name, count]) => ({
    name: name.replace('& Infrastructure', '& Infra').replace('& Solid Waste', '& Waste').replace('& Electricity', '& Power'),
    count,
  }));

  // Format category data
  const catData = Object.entries(stats.by_category).map(([name, count]) => ({
    name: name.split('/')[0],
    count,
  }));

  // Format status data for donut chart
  const statusData = Object.entries(stats.by_status).map(([name, value]) => ({
    name,
    value,
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 1. Department Workload Distribution */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide mb-4">
          Grievance Load by Department
        </h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={deptData} layout="vertical" margin={{ left: 10, right: 20, top: 10, bottom: 10 }}>
              <XAxis type="number" allowDecimals={false} stroke="#94a3b8" fontSize={11} />
              <YAxis
                type="category"
                dataKey="name"
                width={130}
                stroke="#94a3b8"
                fontSize={11}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="count" fill="#1b4d3e" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. Status Distribution Donut */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
        <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide mb-2">
          Municipal Resolution Funnel
        </h3>
        <div className="h-56 w-full flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statusData}
                innerRadius={55}
                outerRadius={80}
                paddingAngle={4}
                dataKey="value"
              >
                {statusData.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={STATUS_COLORS[entry.name] || '#64748b'}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '12px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center justify-center gap-6 text-xs font-semibold pt-2 border-t border-slate-100 dark:border-slate-800">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-blue-500" />
            Reported ({stats.reported})
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-500" />
            In Progress ({stats.in_progress})
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500" />
            Resolved ({stats.resolved})
          </span>
        </div>
      </div>

      {/* 3. Category Frequency */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide mb-4">
          Issue Frequency by Category
        </h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={catData} margin={{ left: -15, right: 10, top: 10, bottom: 25 }}>
              <XAxis
                dataKey="name"
                angle={-35}
                textAnchor="end"
                interval={0}
                stroke="#94a3b8"
                fontSize={10}
              />
              <YAxis allowDecimals={false} stroke="#94a3b8" fontSize={11} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="count" fill="#0d9488" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 4. 7-Day Inflow Trend */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide mb-4">
          7-Day Complaint Inflow Trend
        </h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={stats.trend} margin={{ left: -15, right: 15, top: 10, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.3} />
              <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} />
              <YAxis allowDecimals={false} stroke="#94a3b8" fontSize={11} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '12px',
                }}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#f59e0b"
                strokeWidth={3}
                dot={{ r: 4, fill: '#f59e0b' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
