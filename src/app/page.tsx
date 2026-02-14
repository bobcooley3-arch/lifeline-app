'use client'
import React, { useState } from 'react'

export default function Dashboard() {
  const [status, setStatus] = useState('System Standby')
  const [coords, setCoords] = useState('0.0000, 0.0000')

  const testConnection = async () => {
    setStatus('Sending Signal...')
    try {
      const res = await fetch('/api/pulse', {
        method: 'POST',
        body: JSON.stringify({ lat: 40.7128, lng: -74.0060, battery: 100 }),
      })
      if (res.ok) {
        setStatus('Signal Confirmed')
        setCoords('40.7128, -74.0060')
      }
    } catch (e) {
      setStatus('Engine Stall')
    }
  }

  return (
    <div style={{ textAlign: 'center', border: '1px solid #1e293b', padding: '40px', borderRadius: '12px' }}>
      <h1 style={{ fontSize: '24px', marginBottom: '10px' }}>LIFELINE CORE</h1>
      <p style={{ color: '#94a3b8', marginBottom: '30px' }}>Forensic Safety Engine Active</p>
      
      <div style={{ background: '#0f172a', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <div style={{ fontSize: '12px', color: '#64748b' }}>LAST KNOWN POSITION</div>
        <div style={{ fontSize: '32px', fontWeight: 'bold', margin: '10px 0' }}>{coords}</div>
        <div style={{ color: status === 'Signal Confirmed' ? '#4ade80' : '#f87171' }}>{status}</div>
      </div>

      <button 
        onClick={testConnection}
        style={{ background: '#ef4444', color: 'white', border: 'none', padding: '15px 30px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
      >
        TEST NEW YORK SIGNAL
      </button>
    </div>
  )
}
