'use client';

import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

const customPinIcon = L.divIcon({
  className: 'custom-leaflet-marker',
  html: `<div style="background-color: #ff6b5b; width: 32px; height: 32px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; border: 3px solid #14213d; box-shadow: 0 4px 8px rgba(20,33,61,0.3);"><div style="width: 10px; height: 10px; background: #14213d; border-radius: 50%; transform: rotate(45deg);"></div></div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

export default function SinglePinMapInner({
  latitude,
  longitude,
  title,
  address,
}: {
  latitude: number;
  longitude: number;
  title: string;
  address: string;
}) {
  return (
    <div className="w-full h-64 rounded-[20px] overflow-hidden border border-[#14213d]/15 dark:border-white/15 shadow-sm">
      <MapContainer
        center={[latitude, longitude]}
        zoom={15}
        scrollWheelZoom={false}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[latitude, longitude]} icon={customPinIcon}>
          <Popup>
            <div className="text-xs">
              <strong className="block font-bold text-slate-900">{title}</strong>
              <span className="text-slate-600 block mt-0.5">{address}</span>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
