'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'

const ROLES = [
  { value: 'PARENT',   label: 'Parent',   description: 'Track your child\'s progress' },
  { value: 'EDUCATOR', label: 'Educator', description: 'Manage lessons and students' },
] as const

export function RegisterForm() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [role, setRole] = useState<'PARENT' | 'EDUCATOR'>('PARENT')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setLoading(true)

    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role }),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? 'Registration failed')
      setLoading(false)
      return
    }

    // Auto sign-in after registration
    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    setLoading(false)

    if (result?.error) {
      setError('Account created — please sign in')
      router.push('/login')
      return
    }

    router.push(role === 'EDUCATOR' ? '/educator' : '/parent')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Role selector */}
      <div className="grid grid-cols-2 gap-3">
        {ROLES.map(({ value, label, description }) => (
          <button
            key={value}
            type="button"
            onClick={() => setRole(value)}
            className={cn(
              'rounded-xl border-2 p-3 text-left transition',
              role === value
                ? 'border-[var(--alya-purple)] bg-[var(--alya-purple-pale)]'
                : 'border-[var(--alya-purple-light)] bg-white hover:border-[var(--alya-purple-mid)]'
            )}
          >
            <p className={cn(
              'text-sm font-semibold',
              role === value ? 'text-[var(--alya-purple)]' : 'text-[var(--alya-purple-dark)]'
            )}>
              {label}
            </p>
            <p className="mt-0.5 text-xs text-gray-500">{description}</p>
          </button>
        ))}
      </div>

      <div className="space-y-1.5">
        <label htmlFor="name" className="block text-sm font-medium text-[var(--alya-purple-dark)]">
          Full name
        </label>
        <input
          id="name"
          type="text"
          autoComplete="name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={inputClass}
          placeholder="Your name"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="email" className="block text-sm font-medium text-[var(--alya-purple-dark)]">
          Email address
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClass}
          placeholder="you@example.com"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="password" className="block text-sm font-medium text-[var(--alya-purple-dark)]">
          Password
        </label>
        <input
          id="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputClass}
          placeholder="Min. 8 characters"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="confirm-password" className="block text-sm font-medium text-[var(--alya-purple-dark)]">
          Confirm password
        </label>
        <input
          id="confirm-password"
          type="password"
          autoComplete="new-password"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className={inputClass}
          placeholder="••••••••"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className={cn(
          'w-full rounded-xl bg-[var(--alya-purple)] px-4 py-3 text-sm font-semibold text-white',
          'transition hover:bg-[var(--alya-purple-dark)] focus:outline-none focus:ring-2 focus:ring-[var(--alya-purple)]/40',
          'disabled:cursor-not-allowed disabled:opacity-60'
        )}
      >
        {loading ? 'Creating account…' : 'Create account'}
      </button>

      <p className="text-center text-sm text-gray-500">
        Already have an account?{' '}
        <Link href="/login" className="font-medium text-[var(--alya-purple)] hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  )
}

const inputClass = cn(
  'w-full rounded-xl border border-[var(--alya-purple-light)] bg-white px-4 py-2.5',
  'text-sm text-[var(--alya-purple-dark)] placeholder:text-gray-400',
  'outline-none ring-0 transition',
  'focus:border-[var(--alya-purple)] focus:ring-2 focus:ring-[var(--alya-purple)]/20'
)
