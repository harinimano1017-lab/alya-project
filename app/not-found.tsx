export default function NotFound() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      gap: 16,
      fontFamily: 'DM Sans, sans-serif',
      background: '#F7F5F2'
    }}>
      <h1 style={{ fontSize: 72, fontWeight: 700, color: '#6B4FA0', fontFamily: 'Fraunces, serif' }}>
        404
      </h1>
      <p style={{ fontSize: 18, color: '#888' }}>Page not found</p>
      <a href="/" style={{
        background: '#6B4FA0',
        color: 'white',
        padding: '10px 24px',
        borderRadius: 999,
        fontSize: 14,
        fontWeight: 600,
        textDecoration: 'none'
      }}>
        Go Home
      </a>
    </div>
  )
}