'use client';
import { useState, useEffect } from 'react';

export default function AdminPage() {
  const [data, setData] = useState<any>(null);

  const checkPulse = async () => {
    try {
      const res = await fetch('/api/pulse');
      const json = await res.json();
      if (!json.error) setData(json);
    } catch (e) { console.error("Update failed"); }
  };

  useEffect(() => {
    checkPulse();
    const interval = setInterval(checkPulse, 10000);
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
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#020617', color: 'white', fontFamily: 'sans-serif' }}>
      <div style={{ padding: '15px', borderBottom: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>Lifeline Admin</h2>
        <button onClick={runTest} style={{ backgroundColor: '#dc2626', color: 'white', padding: '8px 16px', borderRadius: '6px', border: 'none', fontWeight: 'bold' }}>
          Test New York
        </button>
      </div>
      
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
        {data ? (
          <div>
            <div style={{ fontSize: '1.2rem', marginBottom: '20px' }}>
              📍 Current Location: <br/>
              <span style={{ color: '#60a5fa', fontWeight: 'bold' }}>{data.lat.toFixed(4)}, {data.lng.toFixed(4)}</span>
            </div>
            <p style={{ color: '#94a3b8' }}>Updated: {new Date().toLocaleTimeString()}</p>
          </div>
        ) : (
          <div style={{ color: '#475569' }}>Waiting for Signal...</div>
        )}
      </div>
    </div>
  );
}
