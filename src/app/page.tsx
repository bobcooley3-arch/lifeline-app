'use client';
import { useState, useEffect } from 'react';

export default function AdminPage() {
  const [data, setData] = useState<any>(null);

  const checkPulse = async () => {
    try {
      const res = await fetch('/api/pulse');
      const json = await res.json();
      if (!json.error) setData(json);
    } catch (e) { console.log("Updating..."); }
  };

  useEffect(() => {
    checkPulse();
    const interval = setInterval(checkPulse, 5000);
    return () => clearInterval(interval);
  }, []);

  const runTest = async () => {
    await fetch('/api/pulse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lat: 40.7128, lng: -74.0060 })
    });
    checkPulse();
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#020617', color: 'white', fontFamily: 'sans-serif', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1e293b', paddingBottom: '20px' }}>
        <h1 style={{ margin: 0 }}>Lifeline Admin</h1>
        <button onClick={runTest} style={{ backgroundColor: '#dc2626', color: 'white', padding: '10px 20px', borderRadius: '8px', border: 'none', fontWeight: 'bold' }}>
          Test New York
        </button>
      </div>
      
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
        {data ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: '#60a5fa', fontSize: '3rem', fontWeight: 'bold', marginBottom: '10px' }}>📍 ACTIVE</div>
            <div>Latitude: {data.lat.toFixed(4)}</div>
            <div>Longitude: {data.lng.toFixed(4)}</div>
            <p style={{ color: '#94a3b8', fontSize: '1rem' }}>Last Signal: {data.time || 'Just now'}</p>
          </div>
        ) : (
          <div style={{ color: '#475569' }}>Waiting for Sarah's first signal...</div>
        )}
      </div>
    </div>
  );
}
