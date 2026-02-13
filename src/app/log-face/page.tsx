'use client';
import { useState, useEffect } from 'react';

export default function SarahPage() {
  const [status, setStatus] = useState('Ready');
  const [error, setError] = useState<string | null>(null);

  const sendLocation = async () => {
    setStatus('Sending...');
    if (!navigator.geolocation) {
      setError('GPS not supported');
      return;
    }

    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        const res = await fetch('/api/pulse', {
          method: 'POST',
          body: JSON.stringify({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            batt: (navigator as any).getBattery ? await (navigator as any).getBattery().then((b: any) => Math.round(b.level * 100)) : 100
          })
        });
        if (res.ok) setStatus('Signal Sent! ✅');
      } catch (e) {
        setStatus('Error');
        setError('Check connection');
      }
    }, (err) => setError('Enable GPS permissions'));
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#020617', color: 'white', padding: '20px', textAlign: 'center' }}>
      <h1>Lifeline Sarah</h1>
      <p style={{ color: error ? '#f87171' : '#94a3b8' }}>{error || 'Press below to update Dad'}</p>
      <button 
        onClick={sendLocation}
        style={{ padding: '20px 40px', fontSize: '1.2rem', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold' }}
      >
        {status}
      </button>
    </div>
  );
}
