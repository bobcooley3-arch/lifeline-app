export default function Page() {
  return (
    <main style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      fontFamily: 'sans-serif',
      color: 'white',
      backgroundColor: '#0f172a'
    }}>
      <h1 style={{ fontSize: '2rem' }}>LIFELINE CORE</h1>
      <p style={{ color: '#94a3b8' }}>Forensic Safety Engine v1.0</p>
      <button 
        style={{ padding: '1rem 2rem', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}
        onClick={() => alert('Pulse Active')}
      >
        TEST NEW YORK
      </button>
    </main>
  )
}
