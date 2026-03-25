import Link from 'next/link'
import { LoginForm } from '@/components/auth/LoginForm'

export const metadata = { title: 'Sign in — Alya' }

export default function LoginPage() {
  return (
    <div className="w-full max-w-sm">
      {/* Logo / brand */}
      <div className="mb-8 text-center">
        <h1
          className="text-4xl font-bold tracking-tight"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--alya-purple)' }}
        >
          Alya
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          E-Learning for Deaf &amp; Non-Verbal Children
        </p>
      </div>

      {/* Card */}
      <div className="rounded-2xl border border-[var(--alya-purple-light)] bg-white px-8 py-8 shadow-sm">
        <h2
          className="mb-6 text-xl font-semibold"
          style={{ color: 'var(--alya-purple-dark)' }}
        >
          Welcome back
        </h2>
        <LoginForm />
      </div>
    </div>
  )
}
