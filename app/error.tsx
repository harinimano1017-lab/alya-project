'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: 16, fontFamily: 'DM Sans, sans-serif' }}>
      <h2 style={{ fontSize: 24, fontWeight: 700, color: '#3B1F6B' }}>Something went wrong</h2>
      <button
        onClick={() => reset()}
        style={{ background: '#6B4FA0', color: 'white', border: 'none', padding: '10px 24px', borderRadius: 999, fontSize: 14, cursor: 'pointer' }}>
        Try again
      </button>
    </div>
  )
}