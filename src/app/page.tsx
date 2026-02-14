'use client';
import { useState, useEffect } from 'react';

export default function Home() {
  const [data, setData] = useState<any>(null);

  const sync = async () => {
    try {
      const res = await fetch('/api/pulse');
      const json = await res.json();
      if (json.lat) setData(json);
    } catch (e) { console.log('Syncing...'); }
  };

  useEffect(() => {
    const i = setInterval(sync, 5000);
    return () => clearInterval(i);
  }, []);

  return (
    <div style={{ height: '100vh', backgroundColor: '#020617', color: 'white', padding: '40px', fontFamily: 'sans-serif' }}>
      <h1>Lifeline System Active</h1>
      <div style={{ marginTop: '40px', padding: '20px', border: '1px solid #1e293b', borderRadius: '10px' }}>
        {data ? (
          <div>
            <div style={{ fontSize: '1.2rem', color: '#60a5fa' }}>📍 Current Lat: {data.lat}</div>
            <div style={{ fontSize: '1.2rem', color: '#60a5fa' }}>📍 Current Lng: {data.lng}</div>
            <p>Last Signal: {data.time || 'Active'}</p>
          </div>
        ) : (
          <p>Waiting for Sarah's first signal...</p>
        )}
      </div>
      <button 
        onClick={() => fetch('/api/pulse', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({lat: 40.7128, lng: -74.0060, time: 'TEST'})})}
        style={{ marginTop: '20px', padding: '10px', backgroundColor: '#dc2626', color: 'white', border: 'none', borderRadius: '5px' }}
      >
        TEST NEW YORK
      </button>
    </div>
  );
}

