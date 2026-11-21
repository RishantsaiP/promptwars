'use client';

import React, { useEffect, useState, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Navigation, MapPin, Loader2 } from 'lucide-react';

// Custom Leaflet marker with navy outline and coral accent per design system
const customPinIcon = L.divIcon({
  className: 'custom-leaflet-marker',
  html: `<div style="background-color: #ff6b5b; width: 34px; height: 34px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; border: 3px solid #14213d; box-shadow: 0 4px 10px rgba(20,33,61,0.35);"><div style="width: 10px; height: 10px; background: #14213d; border-radius: 50%; transform: rotate(45deg);"></div></div>`,
  iconSize: [34, 34],
  iconAnchor: [17, 34],
  popupAnchor: [0, -34],
});

interface LocationPickerInnerProps {
  latitude: number;
  longitude: number;
  onLocationChange: (lat: number, lng: number, address?: string) => void;
}

function MapController({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

function DraggableMarker({
  position,
  onChange,
}: {
  position: [number, number];
  onChange: (lat: number, lng: number) => void;
}) {
  const markerRef = useRef<L.Marker>(null);

  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const { lat, lng } = marker.getLatLng();
          onChange(lat, lng);
        }
      },
    }),
    [onChange]
  );

  useMapEvents({
    click(e) {
      onChange(e.latlng.lat, e.latlng.lng);
    },
  });

  return (
    <Marker
      draggable={true}
      eventHandlers={eventHandlers}
      position={position}
      ref={markerRef}
      icon={customPinIcon}
    />
  );
}

export default function LocationPickerInner({
  latitude,
  longitude,
  onLocationChange,
}: LocationPickerInnerProps) {
  const [geolocating, setGeolocating] = useState(false);
  const [reverseGeocoding, setReverseGeocoding] = useState(false);

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      setReverseGeocoding(true);
      const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`;
      const res = await fetch(url, {
        headers: { 'User-Agent': 'CivicResolve-Hackathon/1.0' },
      });
      if (res.ok) {
        const data = await res.json();
        const display = data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
        onLocationChange(lat, lng, display);
      } else {
        onLocationChange(lat, lng);
      }
    } catch {
      onLocationChange(lat, lng);
    } finally {
      setReverseGeocoding(false);
    }
  };

  const handleMarkerMoved = (lat: number, lng: number) => {
    reverseGeocode(lat, lng);
  };

  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setGeolocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        reverseGeocode(lat, lng);
        setGeolocating(false);
      },
      (err) => {
        console.warn('Geolocation failed:', err);
        setGeolocating(false);
        alert('Could not retrieve current location. Defaulting to Coimbatore center.');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  return (
    <div className="relative w-full h-72 sm:h-80 rounded-[24px] overflow-hidden border border-[#14213d]/15 dark:border-white/15 shadow-inner">
      <MapContainer
        center={[latitude, longitude]}
        zoom={14}
        scrollWheelZoom={false}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapController center={[latitude, longitude]} />
        <DraggableMarker position={[latitude, longitude]} onChange={handleMarkerMoved} />
      </MapContainer>

      {/* Floating Controls Overlay */}
      <div className="absolute top-3 right-3 z-[400] flex flex-col gap-2">
        <button
          type="button"
          onClick={handleCurrentLocation}
          disabled={geolocating}
          className="flex items-center gap-1.5 px-3.5 py-2.5 bg-[#fcf9f4] dark:bg-[#14213d] text-[#14213d] dark:text-[#f4ede0] rounded-full shadow-md border border-[#14213d]/15 dark:border-white/15 text-xs font-semibold hover:bg-[#f4ede0] dark:hover:bg-[#1f3156] active:scale-95 transition-all"
        >
          {geolocating ? (
            <Loader2 className="w-4 h-4 animate-spin text-[#ff6b5b]" />
          ) : (
            <Navigation className="w-4 h-4 text-[#ff6b5b]" />
          )}
          <span>{geolocating ? 'Locating...' : 'My Location'}</span>
        </button>
      </div>

      {/* Drag instruction pill */}
      <div className="absolute bottom-2.5 left-2.5 z-[400] bg-[#14213d]/90 backdrop-blur text-[#f4ede0] text-[11px] px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-md pointer-events-none border border-white/10">
        <MapPin className="w-3.5 h-3.5 text-[#ff6b5b]" />
        <span>
          {reverseGeocoding
            ? 'Fetching address text...'
            : 'Click or drag pin to fine-tune exact incident spot'}
        </span>
      </div>
    </div>
  );
}
