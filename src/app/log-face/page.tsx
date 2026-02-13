'use client';
import { useState } from 'react';

export default function SarahPage() {
  const [msg, setMsg] = useState('Ready');
  
  const send = async () => {
    setMsg('Sending...');
    navigator.geolocation.getCurrentPosition(async (p) => {
      await fetch('/api/pulse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lat: p.coords.latitude, lng: p.coords.longitude })
      });
      setMsg('Sent! ✅');
    }, () => setMsg('Turn on GPS'));
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#020617', color: 'white', fontFamily: 'sans-serif' }}>
      <button onClick={send} style={{ padding: '40px', fontSize: '2rem', borderRadius: '20px', backgroundColor: '#2563eb', color: 'white', border: 'none' }}>
        {msg}
      </button>
    </div>
  );
}
