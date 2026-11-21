'use client';

import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import Link from 'next/link';
import type { Issue } from '@/lib/domain/types';
import { PriorityBadge } from '@/components/ui/PriorityBadge';
import { StatusBadge } from '@/components/ui/StatusBadge';

// Semantic priority colors matching WCAG AA palette
function getPriorityColor(priority: string): string {
  switch (priority) {
    case 'Critical':
      return '#991b1b'; // deep crimson
    case 'High':
      return '#9a3412'; // amber-orange
    case 'Medium':
      return '#854d0e'; // golden yellow
    case 'Low':
    default:
      return '#166534'; // sage green
  }
}

function createPriorityIcon(priority: string) {
  const color = getPriorityColor(priority);
  return L.divIcon({
    className: 'custom-priority-pin',
    html: `<div style="background-color: ${color}; width: 30px; height: 30px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; border: 2.5px solid #14213d; box-shadow: 0 4px 10px rgba(20,33,61,0.4);"><div style="width: 8px; height: 8px; background: #f4ede0; border-radius: 50%; transform: rotate(45deg);"></div></div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30],
  });
}

export default function AdminMapInner({ issues }: { issues: Issue[] }) {
  // Center: Coimbatore municipal hub
  const defaultCenter: [number, number] = [11.0147, 76.9557];

  return (
    <div className="w-full h-[650px] rounded-[24px] overflow-hidden border border-[#14213d]/15 dark:border-white/15 shadow-md">
      <MapContainer
        center={defaultCenter}
        zoom={13}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {issues.map((issue) => (
          <Marker
            key={issue.id}
            position={[issue.latitude, issue.longitude]}
            icon={createPriorityIcon(issue.final_priority)}
          >
            <Popup className="custom-popup">
              <div className="p-1 max-w-[260px]">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="font-mono text-[11px] font-bold text-slate-500">
                    {issue.tracking_code}
                  </span>
                  <StatusBadge status={issue.status} />
                </div>
                <h4 className="font-bold text-xs text-slate-900 line-clamp-2 mb-1.5 leading-snug">
                  {issue.title}
                </h4>
                <div className="flex items-center gap-1.5 mb-2">
                  <PriorityBadge priority={issue.final_priority} />
                </div>
                <p className="text-[11px] text-slate-600 line-clamp-1 mb-2">{issue.address}</p>
                <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500">{issue.final_department}</span>
                  <Link
                    href={`/admin/issues/${issue.id}`}
                    className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 underline"
                  >
                    View Details →
                  </Link>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
