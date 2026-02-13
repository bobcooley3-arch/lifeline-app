"use client";
import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';

const MapContainer = dynamic(() => import('react-leaflet').then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then((mod) => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then((mod) => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then((mod) => mod.Popup), { ssr: false });

export default function AdminMap() {
  const [position, setPosition] = useState<[number, number]>([51.505, -0.09]);
  const [L, setL] = useState<any>(null);
  const [lastCheckIn, setLastCheckIn] = useState<string>("Waiting for signal...");

  async function fetchLocation() {
    try {
      const response = await fetch('/api/checkin');
      const data = await response.json();
      if (data && data.lat && data.lng) {
        setPosition([data.lat, data.lng]);
        setLastCheckIn(new Date(data.timestamp).toLocaleTimeString());
      }
    } catch (error) {
      console.error("Error fetching Sarah's location:", error);
    }
  }

  useEffect(() => {
    import('leaflet').then((leaflet) => setL(leaflet));
    
    // Check for new location every 10 seconds
    fetchLocation();
    const interval = setInterval(fetchLocation, 10000);
    return () => clearInterval(interval);
  }, []);

  if (!L) return <div className="p-10 text-center">Initializing Map...</div>;

  const icon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  });

  return (
    <div style={{ height: '100vh', width: '100%' }}>
      <div className="p-4 bg-blue-800 text-white flex justify-between items-center">
        <h1 className="font-bold text-xl">Dad's Safety Portal (Live)</h1>
        <span className="text-sm bg-blue-700 px-3 py-1 rounded">Last Signal: {lastCheckIn}</span>
      </div>
      <MapContainer center={position} zoom={15} style={{ height: 'calc(100vh - 72px)', width: '100%' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker position={position} icon={icon}>
          <Popup>Sarah is here!</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
