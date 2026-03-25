export default function ProgressPage() {
  return (
    <div className="flex min-h-screen items-center justify-center" style={{ background: 'var(--alya-bg)' }}>
      <div className="text-center">
        <h1
          className="text-3xl font-bold"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--alya-purple-dark)' }}
        >
          Progress
        </h1>
        <p className="mt-2 text-sm text-gray-500">Your learning achievements.</p>
      </div>
    </div>
  )
}
