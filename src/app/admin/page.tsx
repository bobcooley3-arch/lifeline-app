"use client";
import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';

// Map parts
const MapContainer = dynamic(() => import('react-leaflet').then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then((mod) => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then((mod) => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then((mod) => mod.Popup), { ssr: false });
const useMap = dynamic(() => import('react-leaflet').then((mod) => mod.useMap), { ssr: false });

// This small component moves the map view when the pin moves
function MapRecenter({ center }: { center: [number, number] }) {
  const map = (window as any).L ? useMap() : null; // Safety check for SSR
  useEffect(() => {
    if (map && center) map.setView(center, 15);
  }, [center, map]);
  return null;
}

export default function AdminMap() {
  const [position, setPosition] = useState<[number, number]>([51.505, -0.09]);
  const [L, setL] = useState<any>(null);
  const [lastCheckIn, setLastCheckIn] = useState<string>("Waiting for signal...");
  const [battery, setBattery] = useState<number | null>(null);

  async function fetchLocation() {
    try {
      const response = await fetch('/api/pulse');
      const data = await response.json();
      
      // Sarah's phone sends data inside 'location' or 'lastKnownLocation'
      const loc = data.location || data.lastKnownLocation;
      
      if (loc && loc.lat && loc.lng) {
        setPosition([loc.lat, loc.lng]);
        setBattery(data.batteryLevel || null);
        setLastCheckIn(new Date(data.lastCheckIn || data.timestamp || Date.now()).toLocaleTimeString());
      }
    } catch (error) {
      console.error("Map fetch error:", error);
    }
  }

  useEffect(() => {
    import('leaflet').then((leaflet) => setL(leaflet));
    fetchLocation();
    const interval = setInterval(fetchLocation, 10000); // Check every 10s
    return () => clearInterval(interval);
  }, []);

  if (!L) return <div className="p-10 text-center">Loading Safety Portal...</div>;

  const icon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  });

  return (
    <div style={{ height: '100vh', width: '100%' }} className="bg-slate-900">
      <div className="p-4 bg-blue-900 text-white flex justify-between items-center shadow-xl">
        <div>
          <h1 className="font-black text-xl tracking-tight">DAD&apos;S SAFETY PORTAL</h1>
          <p className="text-xs text-blue-300">LIVE MONITORING ACTIVE</p>
        </div>
        <div className="text-right">
          <div className="text-sm font-bold">Last Signal: {lastCheckIn}</div>
          {battery !== null && (
            <div className={`text-xs ${battery < 20 ? 'text-red-400 animate-pulse' : 'text-emerald-400'}`}>
              Sarah&apos;s Battery: {battery}%
            </div>
          )}
        </div>
      </div>
      
      <MapContainer center={position} zoom={13} style={{ height: 'calc(100vh - 80px)', width: '100%' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker position={position} icon={icon}>
          <Popup>Sarah is here.</Popup>
        </Marker>
        <MapRecenter center={position} />
      </MapContainer>
    </div>
  );
}
