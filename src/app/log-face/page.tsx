'use client';
import { useState } from 'react';

export default function SarahPage() {
  const [status, setStatus] = useState('READY');
  
  const send = async () => {
    setStatus('SENDING...');
    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        await fetch('/api/pulse', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            lat: pos.coords.latitude, 
            lng: pos.coords.longitude,
            time: new Date().toLocaleTimeString() 
          })
        });
        setStatus('SENT! ✅');
      } catch (e) { setStatus('RETRY?'); }
    }, () => setStatus('GPS ERROR'));
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#020617', color: 'white', fontFamily: 'sans-serif' }}>
      <button onClick={send} style={{ padding: '40px 60px', fontSize: '1.8rem', borderRadius: '25px', backgroundColor: '#2563eb', color: 'white', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>
        {status}
      </button>
      <p style={{ marginTop: '20px', color: '#94a3b8' }}>Tap to send location to Dad</p>
    </div>
  );
}
