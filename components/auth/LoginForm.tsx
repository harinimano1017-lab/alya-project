'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'

type UserRole = 'CHILD' | 'PARENT' | 'EDUCATOR' | 'ADMIN'

function getRoleRedirect(role: UserRole): string {
  switch (role) {
    case 'ADMIN':     return '/admin'
    case 'EDUCATOR':  return '/educator'
    case 'PARENT':    return '/parent'
    case 'CHILD':     return '/library'
    default:          return '/'
  }
}

export function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    setLoading(false)

    if (result?.error) {
      setError('Invalid email or password')
      return
    }

    // Fetch session to get role for redirect
    const res = await fetch('/api/auth/session')
    const session = await res.json()
    const role = session?.user?.role as UserRole | undefined
    router.push(role ? getRoleRedirect(role) : '/')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="space-y-1.5">
        <label
          htmlFor="email"
          className="block text-sm font-medium text-[var(--alya-purple-dark)]"
        >
          Email address
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={cn(
            'w-full rounded-xl border border-[var(--alya-purple-light)] bg-white px-4 py-2.5',
            'text-sm text-[var(--alya-purple-dark)] placeholder:text-gray-400',
            'outline-none ring-0 transition',
            'focus:border-[var(--alya-purple)] focus:ring-2 focus:ring-[var(--alya-purple)]/20'
          )}
          placeholder="you@example.com"
        />
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="password"
          className="block text-sm font-medium text-[var(--alya-purple-dark)]"
        >
          Password
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={cn(
            'w-full rounded-xl border border-[var(--alya-purple-light)] bg-white px-4 py-2.5',
            'text-sm text-[var(--alya-purple-dark)] placeholder:text-gray-400',
            'outline-none ring-0 transition',
            'focus:border-[var(--alya-purple)] focus:ring-2 focus:ring-[var(--alya-purple)]/20'
          )}
          placeholder="••••••••"
        />
      </div>

      <div className="flex items-center justify-end">
        <Link
          href="/forgot-password"
          className="text-xs text-[var(--alya-purple)] hover:underline"
        >
          Forgot password?
        </Link>
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
        {loading ? 'Signing in…' : 'Sign in'}
      </button>

      <p className="text-center text-sm text-gray-500">
        Don&apos;t have an account?{' '}
        <Link
          href="/register"
          className="font-medium text-[var(--alya-purple)] hover:underline"
        >
          Create one
        </Link>
      </p>
    </form>
  )
}
