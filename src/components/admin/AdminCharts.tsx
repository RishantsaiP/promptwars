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

// Palette colors for Recharts: navy, coral, sand, slate-blue, sage
const STATUS_COLORS: Record<string, string> = {
  Reported: '#3b82f6', // slate-blue
  'In Progress': '#ff6b5b', // coral
  Resolved: '#166534', // sage
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

  // Clean, high-contrast labels for charts in both themes (cream #f4ede0 / slate-200)
  const axisColor = '#e2e8f0';
  const axisOpacity = 0.85;
  const barColor = '#38bdf8'; // bright sky blue for department bars
  const gridColor = 'rgba(255, 255, 255, 0.12)';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 1. Department Workload Distribution */}
      <div className="p-6 rounded-[24px] bg-[#fcf9f4] dark:bg-white/[0.04] border border-[#14213d]/10 dark:border-white/10 shadow-sm">
        <h3 className="text-xs font-bold text-[#14213d]/70 dark:text-[#f4ede0]/90 uppercase tracking-wider mb-4">
          Grievance Load by Department
        </h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={deptData} layout="vertical" margin={{ left: 10, right: 20, top: 10, bottom: 10 }}>
              <XAxis type="number" allowDecimals={false} stroke={axisColor} strokeOpacity={axisOpacity} fontSize={11} tick={{ fill: axisColor }} />
              <YAxis
                type="category"
                dataKey="name"
                width={130}
                stroke={axisColor}
                strokeOpacity={axisOpacity}
                fontSize={11}
                tick={{ fill: axisColor }}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0c1322',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '16px',
                  color: '#f4ede0',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="count" fill={barColor} radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. Status Distribution Donut */}
      <div className="p-6 rounded-[24px] bg-[#fcf9f4] dark:bg-white/[0.04] border border-[#14213d]/10 dark:border-white/10 shadow-sm flex flex-col justify-between">
        <h3 className="text-xs font-bold text-[#14213d]/70 dark:text-[#f4ede0]/90 uppercase tracking-wider mb-2">
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
                    fill={STATUS_COLORS[entry.name] || '#38bdf8'}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0c1322',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '16px',
                  color: '#f4ede0',
                  fontSize: '12px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center justify-center gap-6 text-xs font-semibold pt-3 border-t border-[#14213d]/10 dark:border-white/10">
          <span className="flex items-center gap-1.5 text-[#14213d] dark:text-[#f4ede0]">
            <span className="w-3 h-3 rounded-full bg-[#3b82f6]" />
            Reported ({stats.reported})
          </span>
          <span className="flex items-center gap-1.5 text-[#14213d] dark:text-[#f4ede0]">
            <span className="w-3 h-3 rounded-full bg-[#ff6b5b]" />
            In Progress ({stats.in_progress})
          </span>
          <span className="flex items-center gap-1.5 text-[#14213d] dark:text-[#f4ede0]">
            <span className="w-3 h-3 rounded-full bg-[#166534]" />
            Resolved ({stats.resolved})
          </span>
        </div>
      </div>

      {/* 3. Category Frequency */}
      <div className="p-6 rounded-[24px] bg-[#fcf9f4] dark:bg-white/[0.04] border border-[#14213d]/10 dark:border-white/10 shadow-sm">
        <h3 className="text-xs font-bold text-[#14213d]/70 dark:text-[#f4ede0]/90 uppercase tracking-wider mb-4">
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
                stroke={axisColor}
                strokeOpacity={axisOpacity}
                fontSize={10}
                tick={{ fill: axisColor }}
              />
              <YAxis allowDecimals={false} stroke={axisColor} strokeOpacity={axisOpacity} fontSize={11} tick={{ fill: axisColor }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0c1322',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '16px',
                  color: '#f4ede0',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="count" fill="#ff6b5b" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 4. 7-Day Inflow Trend */}
      <div className="p-6 rounded-[24px] bg-[#fcf9f4] dark:bg-white/[0.04] border border-[#14213d]/10 dark:border-white/10 shadow-sm">
        <h3 className="text-xs font-bold text-[#14213d]/70 dark:text-[#f4ede0]/90 uppercase tracking-wider mb-4">
          7-Day Complaint Inflow Trend
        </h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={stats.trend} margin={{ left: -15, right: 15, top: 10, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} opacity={0.6} />
              <XAxis dataKey="date" stroke={axisColor} strokeOpacity={axisOpacity} fontSize={10} tick={{ fill: axisColor }} />
              <YAxis allowDecimals={false} stroke={axisColor} strokeOpacity={axisOpacity} fontSize={11} tick={{ fill: axisColor }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0c1322',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '16px',
                  color: '#f4ede0',
                  fontSize: '12px',
                }}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#ff6b5b"
                strokeWidth={3}
                dot={{ r: 4, fill: '#ff6b5b', stroke: '#0c1322', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
